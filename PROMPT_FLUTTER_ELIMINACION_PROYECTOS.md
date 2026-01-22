# Prompt para Eliminar Proyectos, Milestones, Tasks y Checklist Items en Flutter

## Contexto General

Este prompt detalla cómo implementar la funcionalidad de eliminación para todas las entidades del sistema de proyectos. Las eliminaciones pueden tener efectos en cascada y afectar los estados de las entidades relacionadas.

**Importante:** Las eliminaciones son **irreversibles**. Siempre solicita confirmación al usuario antes de eliminar.

## Autenticación

Todos los endpoints requieren autenticación con Firebase JWT. El prefijo global de la API es `/api`.

```
Authorization: Bearer <firebase_id_token>
```

## Endpoints de Eliminación (DELETE)

### 1. Eliminar Proyecto

**Endpoint:** `DELETE /api/projects/:id`

**Parámetros de URL:**
- `id`: UUID del proyecto

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Respuesta Exitosa (204 No Content):**
- No hay body en la respuesta
- El proyecto y todas sus entidades relacionadas (milestones, tasks, checklist items) se eliminan en cascada

**Errores:**
- `404 Not Found`: Proyecto no encontrado
- `403 Forbidden`: No tienes permiso para eliminar este proyecto
- `401 Unauthorized`: Token inválido

**Notas Importantes:**
- **La eliminación es permanente e irreversible**
- Al eliminar un proyecto, se eliminan automáticamente:
  - Todos sus milestones
  - Todas las tasks de esos milestones
  - Todos los checklist items de esas tasks
  - Las rewards asociadas (si no están siendo usadas por otros recursos)
- **Siempre solicita confirmación explícita del usuario**

### 2. Eliminar Milestone

**Endpoint:** `DELETE /api/projects/:projectId/milestones/:id`

**Parámetros de URL:**
- `projectId`: UUID del proyecto
- `id`: UUID del milestone

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Respuesta Exitosa (204 No Content):**
- No hay body en la respuesta
- El milestone y todas sus tasks y checklist items se eliminan en cascada

**Errores:**
- `404 Not Found`: Milestone no encontrado
- `403 Forbidden`: No tienes permiso para eliminar este milestone
- `401 Unauthorized`: Token inválido

**Notas Importantes:**
- **La eliminación es permanente e irreversible**
- Al eliminar un milestone, se eliminan automáticamente:
  - Todas sus tasks
  - Todos los checklist items de esas tasks
- **El estado del proyecto puede cambiar** después de eliminar un milestone (debes recargar el proyecto)
- **Siempre solicita confirmación explícita del usuario**

### 3. Eliminar Task

**Endpoint:** `DELETE /api/milestone/:milestoneId/task/:id`

**Parámetros de URL:**
- `milestoneId`: UUID del milestone
- `id`: UUID de la task

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Respuesta Exitosa (204 No Content):**
- No hay body en la respuesta
- La task y todos sus checklist items se eliminan en cascada

**Errores:**
- `404 Not Found`: Task no encontrada
- `403 Forbidden`: No tienes permiso para eliminar esta task
- `401 Unauthorized`: Token inválido

**Notas Importantes:**
- **La eliminación es permanente e irreversible**
- Al eliminar una task, se eliminan automáticamente:
  - Todos sus checklist items
- **El estado del milestone puede cambiar** después de eliminar una task (debes recargar el milestone)
- **El estado del proyecto puede cambiar** si el milestone cambia de estado (debes recargar el proyecto)
- **Siempre solicita confirmación explícita del usuario**

### 4. Eliminar Checklist Item

**Endpoint:** `DELETE /api/tasks/:taskId/checklist-items/:id`

**Parámetros de URL:**
- `taskId`: UUID de la task
- `id`: UUID del checklist item

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Respuesta Exitosa (204 No Content):**
- No hay body en la respuesta
- **El estado de la task se actualiza automáticamente** después de eliminar el checklist item

**Errores:**
- `404 Not Found`: Checklist item no encontrado
- `403 Forbidden`: No tienes permiso para eliminar este checklist item
- `401 Unauthorized`: Token inválido

**Notas Importantes:**
- **La eliminación es permanente e irreversible**
- **Al eliminar un checklist item, el estado de la task se recalcula automáticamente**
- **El estado del milestone puede cambiar** si la task cambia de estado (debes recargar el milestone)
- **El estado del proyecto puede cambiar** si el milestone cambia de estado (debes recargar el proyecto)
- Para checklist items, puedes usar confirmación más simple o incluso eliminación directa con undo

## Efectos en Cascada y Actualización de Estados

### Cascada de Eliminaciones

```
Proyecto eliminado
  └── Todos los Milestones eliminados
      └── Todas las Tasks eliminadas
          └── Todos los Checklist Items eliminados

Milestone eliminado
  └── Todas las Tasks eliminadas
      └── Todos los Checklist Items eliminados

Task eliminada
  └── Todos los Checklist Items eliminados

Checklist Item eliminado
  └── (Solo se actualiza el estado de la Task)
```

### Actualización Automática de Estados

**Al eliminar un Checklist Item:**
1. Se elimina el checklist item
2. **Automáticamente** se recalcula el estado de la task
3. **Debes recargar** la task, el milestone y el proyecto para ver los cambios

**Al eliminar una Task:**
1. Se elimina la task y sus checklist items
2. El estado del milestone puede cambiar (menos tasks)
3. **Debes recargar** el milestone y el proyecto

**Al eliminar un Milestone:**
1. Se elimina el milestone y todas sus tasks
2. El estado del proyecto puede cambiar (menos milestones)
3. **Debes recargar** el proyecto

**Al eliminar un Proyecto:**
1. Se elimina todo
2. **Debes navegar de vuelta** a la lista de proyectos

## Estrategias de Eliminación en Flutter

### Estrategia 1: Confirmación con Dialog (Recomendada para Proyectos/Milestones/Tasks)

Siempre solicita confirmación explícita antes de eliminar:

```dart
Future<bool> _confirmDelete(String title, String message) async {
  return await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(context, true),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
          ),
          child: Text('Eliminar'),
        ),
      ],
    ),
  ) ?? false;
}

Future<void> _deleteProject(Project project) async {
  final confirmed = await _confirmDelete(
    'Eliminar Proyecto',
    '¿Estás seguro de que quieres eliminar "${project.name}"? Esta acción no se puede deshacer y eliminará todos los milestones, tasks y checklist items asociados.',
  );
  
  if (!confirmed) return;
  
  try {
    await projectService.deleteProject(project.id);
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Proyecto eliminado exitosamente'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context); // Volver a la lista
    }
  } catch (e) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al eliminar: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
```

### Estrategia 2: Swipe to Delete (Recomendada para Listas)

Permite eliminar deslizando en listas:

```dart
class ProjectListItem extends StatelessWidget {
  final Project project;
  final Function(Project) onDelete;
  
  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(project.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: EdgeInsets.only(right: 20),
        color: Colors.red,
        child: Icon(Icons.delete, color: Colors.white),
      ),
      confirmDismiss: (direction) async {
        return await _confirmDelete(
          context,
          'Eliminar Proyecto',
          '¿Eliminar "${project.name}"?',
        );
      },
      onDismissed: (direction) {
        onDelete(project);
      },
      child: ListTile(
        title: Text(project.name),
        subtitle: Text(project.description ?? ''),
        // ...
      ),
    );
  }
}
```

### Estrategia 3: Eliminación Directa con Undo (Recomendada para Checklist Items)

Para checklist items, puedes permitir eliminación directa con opción de deshacer:

```dart
Future<void> _deleteChecklistItem(ChecklistItem item) async {
  // Guardar referencia para undo
  final deletedItem = item;
  final taskId = item.taskId;
  
  // Eliminar optimísticamente
  setState(() {
    checklistItems.removeWhere((i) => i.id == item.id);
  });
  
  try {
    await checklistItemService.deleteChecklistItem(
      taskId: taskId!,
      checklistItemId: item.id,
    );
    
    // Recargar task para actualizar estado
    final updatedTask = await taskService.getTask(
      taskId: taskId,
      milestoneId: milestoneId,
    );
    
    // Mostrar snackbar con undo
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Item eliminado'),
          action: SnackBarAction(
            label: 'DESHACER',
            onPressed: () async {
              // Recrear el item
              await checklistItemService.createChecklistItem(
                taskId: taskId,
                description: deletedItem.description,
                isRequired: deletedItem.isRequired,
                isChecked: deletedItem.isChecked,
              );
              // Recargar lista
              _refreshChecklistItems();
            },
          ),
          duration: Duration(seconds: 5),
        ),
      );
    }
    
    // Actualizar UI con nueva task
    setState(() {
      currentTask = updatedTask;
    });
    
    // Recargar milestone y proyecto en background
    _refreshRelatedData();
  } catch (e) {
    // Revertir si falla
    setState(() {
      checklistItems.add(deletedItem);
    });
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al eliminar: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
```

### Estrategia 4: Menú de Acciones con Opción Eliminar

Mostrar un menú contextual con opción de eliminar:

```dart
PopupMenuButton<String>(
  onSelected: (value) {
    if (value == 'delete') {
      _deleteProject(project);
    } else if (value == 'edit') {
      _editProject(project);
    }
  },
  itemBuilder: (context) => [
    PopupMenuItem(
      value: 'edit',
      child: Row(
        children: [
          Icon(Icons.edit, size: 20),
          SizedBox(width: 8),
          Text('Editar'),
        ],
      ),
    ),
    PopupMenuItem(
      value: 'delete',
      child: Row(
        children: [
          Icon(Icons.delete, size: 20, color: Colors.red),
          SizedBox(width: 8),
          Text('Eliminar', style: TextStyle(color: Colors.red)),
        ],
      ),
    ),
  ],
  child: Icon(Icons.more_vert),
)
```

## Manejo de Errores

### Errores Comunes y Cómo Manejarlos

```dart
Future<void> deleteProject(String projectId) async {
  try {
    await projectService.deleteProject(projectId);
    // Éxito - ya manejado en el método que llama
  } on UnauthorizedException {
    // Token expirado
    Navigator.pushReplacementNamed(context, '/login');
    throw Exception('Sesión expirada. Por favor, inicia sesión nuevamente.');
  } on NotFoundException {
    // Ya fue eliminado (puede haber sido eliminado por otro dispositivo)
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('El proyecto ya no existe')),
    );
    throw Exception('Proyecto no encontrado');
  } on ForbiddenException {
    // Sin permisos
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('No tienes permiso para eliminar este proyecto')),
    );
    throw Exception('Sin permisos');
  } on NetworkException {
    // Sin conexión
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Sin conexión a internet')),
    );
    throw Exception('Sin conexión');
  } catch (e) {
    // Error genérico
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error: ${e.toString()}')),
    );
    throw e;
  }
}
```

## Recarga de Datos Después de Eliminación

### Después de Eliminar Checklist Item

```dart
Future<void> _deleteChecklistItem(ChecklistItem item) async {
  try {
    await checklistItemService.deleteChecklistItem(
      taskId: item.taskId!,
      checklistItemId: item.id,
    );
    
    // Recargar task (su estado puede haber cambiado)
    final updatedTask = await taskService.getTask(
      taskId: item.taskId!,
      milestoneId: milestoneId,
    );
    
    // Recargar milestone (su estado puede haber cambiado)
    final updatedMilestone = await milestoneService.getMilestone(
      projectId: projectId,
      milestoneId: milestoneId,
    );
    
    // Recargar proyecto (su estado puede haber cambiado)
    final updatedProject = await projectService.getProjectById(projectId);
    
    // Recargar progreso
    final updatedProgress = await projectService.getProjectProgress(projectId);
    
    // Actualizar UI
    setState(() {
      currentTask = updatedTask;
      currentMilestone = updatedMilestone;
      currentProject = updatedProject;
      projectProgress = updatedProgress;
      // Remover item de la lista
      checklistItems.removeWhere((i) => i.id == item.id);
    });
  } catch (e) {
    // Manejar error
  }
}
```

### Después de Eliminar Task

```dart
Future<void> _deleteTask(Task task) async {
  final confirmed = await _confirmDelete(
    'Eliminar Tarea',
    '¿Estás seguro de que quieres eliminar "${task.name}"? Esta acción eliminará todos los checklist items asociados.',
  );
  
  if (!confirmed) return;
  
  try {
    await taskService.deleteTask(
      taskId: task.id,
      milestoneId: task.milestoneId,
    );
    
    // Recargar milestone (su estado puede haber cambiado)
    final updatedMilestone = await milestoneService.getMilestone(
      projectId: projectId,
      milestoneId: task.milestoneId,
    );
    
    // Recargar proyecto (su estado puede haber cambiado)
    final updatedProject = await projectService.getProjectById(projectId);
    
    // Recargar progreso
    final updatedProgress = await projectService.getProjectProgress(projectId);
    
    // Actualizar UI
    setState(() {
      currentMilestone = updatedMilestone;
      currentProject = updatedProject;
      projectProgress = updatedProgress;
      // Remover task de la lista
      tasks.removeWhere((t) => t.id == task.id);
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Tarea eliminada exitosamente')),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error: ${e.toString()}')),
    );
  }
}
```

### Después de Eliminar Milestone

```dart
Future<void> _deleteMilestone(Milestone milestone) async {
  final confirmed = await _confirmDelete(
    'Eliminar Milestone',
    '¿Estás seguro de que quieres eliminar "${milestone.name}"? Esta acción eliminará todas las tasks y checklist items asociados.',
  );
  
  if (!confirmed) return;
  
  try {
    await milestoneService.deleteMilestone(
      projectId: projectId,
      milestoneId: milestone.id,
    );
    
    // Recargar proyecto (su estado puede haber cambiado)
    final updatedProject = await projectService.getProjectById(projectId);
    
    // Recargar progreso
    final updatedProgress = await projectService.getProjectProgress(projectId);
    
    // Actualizar UI
    setState(() {
      currentProject = updatedProject;
      projectProgress = updatedProgress;
      // Remover milestone de la lista
      milestones.removeWhere((m) => m.id == milestone.id);
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Milestone eliminado exitosamente')),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error: ${e.toString()}')),
    );
  }
}
```

### Después de Eliminar Proyecto

```dart
Future<void> _deleteProject(Project project) async {
  final confirmed = await _confirmDelete(
    'Eliminar Proyecto',
    '¿Estás seguro de que quieres eliminar "${project.name}"? Esta acción es permanente y eliminará todos los milestones, tasks y checklist items asociados.',
  );
  
  if (!confirmed) return;
  
  try {
    await projectService.deleteProject(project.id);
    
    // Navegar de vuelta a la lista de proyectos
    Navigator.popUntil(context, (route) => route.isFirst);
    
    // Recargar lista de proyectos
    _refreshProjectsList();
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Proyecto eliminado exitosamente'),
        backgroundColor: Colors.green,
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Error: ${e.toString()}'),
        backgroundColor: Colors.red,
      ),
    );
  }
}
```

## Consideraciones de UX

### 1. Confirmaciones Diferenciadas por Importancia

```dart
Future<bool> _confirmDelete(String entityType, String entityName) async {
  String title;
  String message;
  
  switch (entityType) {
    case 'project':
      title = 'Eliminar Proyecto';
      message = '¿Estás seguro de que quieres eliminar "$entityName"?\n\n'
          'Esta acción es PERMANENTE e IRREVERSIBLE.\n\n'
          'Se eliminarán:\n'
          '• Todos los milestones\n'
          '• Todas las tasks\n'
          '• Todos los checklist items\n\n'
          'Esta acción no se puede deshacer.';
      break;
    case 'milestone':
      title = 'Eliminar Milestone';
      message = '¿Estás seguro de que quieres eliminar "$entityName"?\n\n'
          'Se eliminarán todas las tasks y checklist items asociados.';
      break;
    case 'task':
      title = 'Eliminar Tarea';
      message = '¿Estás seguro de que quieres eliminar "$entityName"?\n\n'
          'Se eliminarán todos los checklist items asociados.';
      break;
    case 'checklist':
      title = 'Eliminar Item';
      message = '¿Eliminar "$entityName"?';
      break;
    default:
      title = 'Confirmar Eliminación';
      message = '¿Estás seguro?';
  }
  
  return await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(context, true),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
          ),
          child: Text('Eliminar'),
        ),
      ],
    ),
  ) ?? false;
}
```

### 2. Indicadores de Carga Durante Eliminación

```dart
bool _isDeleting = false;

Future<void> _deleteProject(Project project) async {
  if (_isDeleting) return; // Prevenir múltiples eliminaciones
  
  final confirmed = await _confirmDelete('project', project.name);
  if (!confirmed) return;
  
  setState(() => _isDeleting = true);
  
  try {
    await projectService.deleteProject(project.id);
    // ...
  } finally {
    if (mounted) {
      setState(() => _isDeleting = false);
    }
  }
}

// En el widget
if (_isDeleting)
  CircularProgressIndicator()
else
  IconButton(
    icon: Icon(Icons.delete),
    onPressed: () => _deleteProject(project),
  )
```

### 3. Feedback Visual Inmediato

```dart
// Optimistic delete con animación
Future<void> _deleteWithAnimation(ChecklistItem item) async {
  // Animar eliminación
  setState(() {
    checklistItems.removeWhere((i) => i.id == item.id);
  });
  
  try {
    await checklistItemService.deleteChecklistItem(
      taskId: item.taskId!,
      checklistItemId: item.id,
    );
    // Recargar datos relacionados
    _refreshRelatedData();
  } catch (e) {
    // Revertir si falla
    setState(() {
      checklistItems.add(item);
    });
    // Mostrar error
  }
}
```

### 4. Prevenir Eliminaciones Accidentales

Para proyectos importantes, considera una doble confirmación:

```dart
Future<bool> _confirmDeleteWithDoubleCheck(Project project) async {
  // Primera confirmación
  final firstConfirm = await _confirmDelete('project', project.name);
  if (!firstConfirm) return false;
  
  // Segunda confirmación con texto diferente
  return await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text('Confirmación Final'),
      content: Text(
        'Esta es tu última oportunidad.\n\n'
        '¿Realmente quieres eliminar "${project.name}"?\n\n'
        'Escribe "ELIMINAR" para confirmar.',
      ),
      // Puedes agregar un campo de texto para escribir "ELIMINAR"
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(context, true),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
          ),
          child: Text('Confirmar Eliminación'),
        ),
      ],
    ),
  ) ?? false;
}
```

## Ejemplo Completo de Implementación

```dart
class ProjectDetailScreen extends StatefulWidget {
  final Project project;
  
  @override
  _ProjectDetailScreenState createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  Project? currentProject;
  List<Milestone> milestones = [];
  bool _isDeleting = false;
  
  @override
  void initState() {
    super.initState();
    currentProject = widget.project;
    _loadData();
  }
  
  Future<void> _loadData() async {
    try {
      final loadedMilestones = await milestoneService.getProjectMilestones(
        currentProject!.id,
      );
      setState(() {
        milestones = loadedMilestones;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar datos: ${e.toString()}')),
      );
    }
  }
  
  Future<bool> _confirmDelete(String title, String message) async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: Text('Eliminar'),
          ),
        ],
      ),
    ) ?? false;
  }
  
  Future<void> _deleteProject() async {
    if (_isDeleting) return;
    
    final confirmed = await _confirmDelete(
      'Eliminar Proyecto',
      '¿Estás seguro de que quieres eliminar "${currentProject!.name}"?\n\n'
      'Esta acción es PERMANENTE e IRREVERSIBLE.\n\n'
      'Se eliminarán todos los milestones, tasks y checklist items asociados.',
    );
    
    if (!confirmed) return;
    
    setState(() => _isDeleting = true);
    
    try {
      await projectService.deleteProject(currentProject!.id);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Proyecto eliminado exitosamente'),
            backgroundColor: Colors.green,
          ),
        );
        // Navegar de vuelta
        Navigator.popUntil(context, (route) => route.isFirst);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isDeleting = false);
      }
    }
  }
  
  Future<void> _deleteMilestone(Milestone milestone) async {
    final confirmed = await _confirmDelete(
      'Eliminar Milestone',
      '¿Estás seguro de que quieres eliminar "${milestone.name}"?\n\n'
      'Se eliminarán todas las tasks y checklist items asociados.',
    );
    
    if (!confirmed) return;
    
    try {
      await milestoneService.deleteMilestone(
        projectId: currentProject!.id,
        milestoneId: milestone.id,
      );
      
      // Recargar datos
      final updatedProject = await projectService.getProjectById(
        currentProject!.id,
      );
      final updatedProgress = await projectService.getProjectProgress(
        currentProject!.id,
      );
      
      setState(() {
        currentProject = updatedProject;
        milestones.removeWhere((m) => m.id == milestone.id);
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Milestone eliminado exitosamente')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(currentProject?.name ?? 'Proyecto'),
        actions: [
          if (_isDeleting)
            Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'delete') {
                  _deleteProject();
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete, color: Colors.red),
                      SizedBox(width: 8),
                      Text('Eliminar Proyecto', style: TextStyle(color: Colors.red)),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
      body: ListView.builder(
        itemCount: milestones.length,
        itemBuilder: (context, index) {
          final milestone = milestones[index];
          return ListTile(
            title: Text(milestone.name),
            subtitle: Text(milestone.description ?? ''),
            trailing: IconButton(
              icon: Icon(Icons.delete, color: Colors.red),
              onPressed: () => _deleteMilestone(milestone),
            ),
          );
        },
      ),
    );
  }
}
```

## Notas Finales

1. **Siempre solicita confirmación** antes de eliminar, especialmente para proyectos y milestones
2. **Recarga datos relacionados** después de eliminar para mantener la UI sincronizada
3. **Maneja errores apropiadamente** y proporciona feedback claro
4. **Usa optimistic updates** para mejor UX en eliminaciones simples (checklist items)
5. **Considera undo** para eliminaciones que pueden ser accidentales
6. **Diferencia la confirmación** según la importancia de la entidad a eliminar
7. **Previene múltiples eliminaciones** usando flags de estado
8. **Navega apropiadamente** después de eliminar (volver a lista, etc.)
9. **Actualiza indicadores de progreso** después de eliminar entidades
10. **Considera animaciones** para hacer la eliminación más fluida visualmente