# Prompt para Editar Proyectos, Milestones, Tasks y Checklist Items en Flutter

## Contexto General

Este prompt detalla cómo implementar la funcionalidad de edición para todas las entidades del sistema de proyectos. Todas las actualizaciones son parciales (PATCH-like), es decir, solo necesitas enviar los campos que quieres actualizar.

**Importante:** Algunas actualizaciones pueden afectar los estados automáticos en cascada. Es crucial recargar los datos después de cualquier actualización.

## Autenticación

Todos los endpoints requieren autenticación con Firebase JWT. El prefijo global de la API es `/api`.

```
Authorization: Bearer <firebase_id_token>
```

## Endpoints de Actualización (PUT)

### 1. Actualizar Proyecto

**Endpoint:** `PUT /api/projects/:id`

**Parámetros de URL:**
- `id`: UUID del proyecto

**Headers:**
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Body (UpdateProjectDto) - Todos los campos son opcionales:**
```json
{
  "name": "string (opcional, max 255 caracteres)",
  "description": "string (opcional)",
  "purpose": "string (opcional)",
  "budget": "number (opcional)",
  "finalDate": "string (opcional, formato ISO date: 'YYYY-MM-DD')",
  "resourcesAvailable": "object (opcional, JSON)",
  "resourcesNeeded": "object (opcional, JSON)"
}
```

**Ejemplo de Body:**
```json
{
  "name": "Nuevo nombre del proyecto",
  "description": "Nueva descripción",
  "budget": 1500.75,
  "finalDate": "2024-12-31"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "id": "uuid",
  "userId": "string",
  "name": "string",
  "description": "string | null",
  "purpose": "string | null",
  "budget": "number | null",
  "finalDate": "string | null (ISO date)",
  "resourcesAvailable": "object | null",
  "resourcesNeeded": "object | null",
  "sponsoredGoalId": "uuid | null",
  "enrollmentId": "uuid | null",
  "isActive": "boolean",
  "status": "pending | in_progress | completed",
  "rewardId": "uuid",
  "createdAt": "string (ISO datetime)"
}
```

**Errores:**
- `404 Not Found`: Proyecto no encontrado
- `403 Forbidden`: No tienes permiso para modificar este proyecto
- `401 Unauthorized`: Token inválido
- `400 Bad Request`: Errores de validación (formato de fecha inválido, nombre muy largo, etc.)

**Notas:**
- Solo envía los campos que quieres actualizar
- El estado del proyecto NO se puede editar directamente (se actualiza automáticamente)
- `rewardId`, `sponsoredGoalId`, `enrollmentId`, `isActive` y `status` NO se pueden editar mediante este endpoint
- `userId` y `createdAt` nunca cambian

### 2. Actualizar Milestone

**Endpoint:** `PUT /api/projects/:projectId/milestones/:id`

**Parámetros de URL:**
- `projectId`: UUID del proyecto
- `id`: UUID del milestone

**Headers:**
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Body (UpdateMilestoneDto) - Todos los campos son opcionales:**
```json
{
  "name": "string (opcional, max 255 caracteres)",
  "description": "string (opcional)"
}
```

**Ejemplo de Body:**
```json
{
  "name": "Fase 1: Diseño Actualizado",
  "description": "Nueva descripción del milestone"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "string",
  "description": "string | null",
  "status": "pending | in_progress | completed",
  "rewardId": "uuid | null",
  "createdAt": "string (ISO datetime)"
}
```

**Errores:**
- `404 Not Found`: Milestone no encontrado
- `403 Forbidden`: No tienes permiso para modificar este milestone
- `401 Unauthorized`: Token inválido
- `400 Bad Request`: Errores de validación

**Notas:**
- Solo se pueden editar `name` y `description`
- El estado del milestone NO se puede editar directamente (se actualiza automáticamente según las tasks)
- `rewardId` NO se puede editar mediante este endpoint (se asigna al crear)
- `projectId` y `createdAt` nunca cambian

### 3. Actualizar Task

**Endpoint:** `PUT /api/milestone/:milestoneId/task/:id`

**Parámetros de URL:**
- `milestoneId`: UUID del milestone
- `id`: UUID de la task

**Headers:**
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Body (UpdateTaskDto) - Todos los campos son opcionales:**
```json
{
  "name": "string (opcional, max 255 caracteres)",
  "description": "string (opcional)",
  "startDate": "string (opcional, formato ISO date: 'YYYY-MM-DD')",
  "endDate": "string (opcional, formato ISO date: 'YYYY-MM-DD')",
  "resourcesAvailable": "object (opcional, JSON)",
  "resourcesNeeded": "object (opcional, JSON)",
  "incentivePoints": "number (opcional, mínimo 0)"
}
```

**Ejemplo de Body:**
```json
{
  "name": "Tarea actualizada",
  "description": "Nueva descripción",
  "startDate": "2024-02-01",
  "endDate": "2024-02-15",
  "incentivePoints": 20
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "id": "uuid",
  "milestoneId": "uuid",
  "sprintId": "uuid | null",
  "name": "string",
  "description": "string | null",
  "status": "pending | in_progress | completed",
  "startDate": "string (ISO date)",
  "endDate": "string (ISO date)",
  "resourcesAvailable": "object | null",
  "resourcesNeeded": "object | null",
  "incentivePoints": "number | null",
  "createdAt": "string (ISO datetime)"
}
```

**Errores:**
- `404 Not Found`: Task no encontrada
- `403 Forbidden`: No tienes permiso para modificar esta task
- `401 Unauthorized`: Token inválido
- `400 Bad Request`: Errores de validación (fechas inválidas, periodo excede sprint, etc.)

**Notas:**
- El estado de la task NO se puede editar directamente (se actualiza automáticamente según los checklist items)
- Si se actualiza `startDate` o `endDate`, el backend valida que:
  - `startDate` sea anterior a `endDate`
  - Si la task tiene un `sprintId`, el periodo no exceda el periodo del sprint
- `milestoneId`, `sprintId` y `createdAt` no se pueden editar mediante este endpoint
- `incentivePoints` debe ser >= 0

### 4. Actualizar Checklist Item

**Endpoint:** `PUT /api/tasks/:taskId/checklist-items/:id`

**Parámetros de URL:**
- `taskId`: UUID de la task
- `id`: UUID del checklist item

**Headers:**
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Body (UpdateChecklistItemDto) - Todos los campos son opcionales:**
```json
{
  "description": "string (opcional)",
  "isRequired": "boolean (opcional)",
  "isChecked": "boolean (opcional)"
}
```

**Ejemplo de Body:**
```json
{
  "isChecked": true
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "id": "uuid",
  "taskId": "uuid | null",
  "description": "string",
  "isRequired": "boolean",
  "isChecked": "boolean",
  "createdAt": "string (ISO datetime)"
}
```

**Errores:**
- `404 Not Found`: Checklist item no encontrado
- `403 Forbidden`: No tienes permiso para modificar este checklist item
- `401 Unauthorized`: Token inválido

**Notas Importantes:**
- **Al actualizar `isChecked`, el estado de la task se actualiza automáticamente**
- **Al actualizar `isRequired`, el estado de la task se recalcula automáticamente**
- Este es el endpoint más importante para la funcionalidad de marcar/desmarcar items del checklist
- `taskId` y `createdAt` no se pueden editar

## Actualización Automática de Estados

### Cascada de Actualizaciones

Cuando actualizas un checklist item (especialmente `isChecked`), se dispara una cascada de actualizaciones:

1. **Checklist Item actualizado** → 
2. **Task** (estado recalculado automáticamente) →
3. **Milestone** (estado recalculado automáticamente) →
4. **Project** (estado recalculado automáticamente)

**Por lo tanto, después de actualizar un checklist item, debes recargar:**
- La task (para ver su nuevo estado)
- El milestone (para ver si cambió su estado)
- El proyecto (para ver si cambió su estado)
- El progreso del proyecto (para actualizar indicadores visuales)

### Ejemplo de Flujo de Actualización

```dart
// 1. Marcar checklist item como completado
await checklistItemService.updateChecklistItem(
  taskId: taskId,
  checklistItemId: checklistItemId,
  isChecked: true,
);

// 2. Recargar la task (su estado puede haber cambiado)
final updatedTask = await taskService.getTask(
  taskId: taskId,
  milestoneId: milestoneId,
);

// 3. Recargar el milestone (su estado puede haber cambiado)
final updatedMilestone = await milestoneService.getMilestone(
  projectId: projectId,
  milestoneId: milestoneId,
);

// 4. Recargar el proyecto (su estado puede haber cambiado)
final updatedProject = await projectService.getProjectById(projectId);

// 5. Recargar el progreso del proyecto
final updatedProgress = await projectService.getProjectProgress(projectId);

// 6. Actualizar la UI
setState(() {
  currentTask = updatedTask;
  currentMilestone = updatedMilestone;
  currentProject = updatedProject;
  projectProgress = updatedProgress;
});
```

## Estrategias de Edición en Flutter

### Estrategia 1: Formulario Completo (Recomendada para Proyectos/Milestones/Tasks)

Mostrar un formulario con todos los campos editables:

```dart
class EditProjectScreen extends StatefulWidget {
  final Project project;
  
  @override
  _EditProjectScreenState createState() => _EditProjectScreenState();
}

class _EditProjectScreenState extends State<EditProjectScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  late TextEditingController _purposeController;
  late TextEditingController _budgetController;
  DateTime? _finalDate;
  
  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.project.name);
    _descriptionController = TextEditingController(text: widget.project.description ?? '');
    _purposeController = TextEditingController(text: widget.project.purpose ?? '');
    _budgetController = TextEditingController(
      text: widget.project.budget?.toString() ?? '',
    );
    _finalDate = widget.project.finalDate;
  }
  
  Future<void> _saveChanges() async {
    if (!_formKey.currentState!.validate()) return;
    
    try {
      // Construir DTO solo con campos que han cambiado
      final updateDto = UpdateProjectDto(
        name: _nameController.text != widget.project.name 
          ? _nameController.text 
          : null,
        description: _descriptionController.text != (widget.project.description ?? '')
          ? _descriptionController.text
          : null,
        purpose: _purposeController.text != (widget.project.purpose ?? '')
          ? _purposeController.text
          : null,
        budget: _budgetController.text.isNotEmpty 
          ? double.tryParse(_budgetController.text)
          : null,
        finalDate: _finalDate != widget.project.finalDate
          ? _finalDate?.toIso8601String().split('T')[0]
          : null,
      );
      
      // Filtrar campos nulos (no enviar campos que no cambiaron)
      final updateData = updateDto.toJson()..removeWhere((key, value) => value == null);
      
      // Actualizar
      final updatedProject = await projectService.updateProject(
        projectId: widget.project.id,
        updateDto: updateData,
      );
      
      // Mostrar mensaje de éxito
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Proyecto actualizado exitosamente')),
      );
      
      // Navegar de vuelta con el proyecto actualizado
      Navigator.pop(context, updatedProject);
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
        title: Text('Editar Proyecto'),
        actions: [
          IconButton(
            icon: Icon(Icons.save),
            onPressed: _saveChanges,
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(labelText: 'Nombre'),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'El nombre es requerido';
                }
                if (value.length > 255) {
                  return 'El nombre no puede exceder 255 caracteres';
                }
                return null;
              },
            ),
            // ... más campos
          ],
        ),
      ),
    );
  }
}
```

### Estrategia 2: Edición Inline (Recomendada para Checklist Items)

Para checklist items, especialmente marcar/desmarcar, usa edición inline:

```dart
class ChecklistItemWidget extends StatelessWidget {
  final ChecklistItem item;
  final String taskId;
  final Function(ChecklistItem) onUpdated;
  
  @override
  Widget build(BuildContext context) {
    return CheckboxListTile(
      title: Text(item.description),
      subtitle: item.isRequired 
        ? Text('Requerido', style: TextStyle(color: Colors.red))
        : null,
      value: item.isChecked,
      onChanged: (bool? newValue) async {
        if (newValue == null) return;
        
        try {
          // Actualizar inmediatamente (optimistic update)
          final updatedItem = await checklistItemService.updateChecklistItem(
            taskId: taskId,
            checklistItemId: item.id,
            isChecked: newValue,
          );
          
          // Notificar que se actualizó (para recargar task, milestone, etc.)
          onUpdated(updatedItem);
          
          // Mostrar feedback visual
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(newValue 
                ? 'Item marcado como completado' 
                : 'Item desmarcado'),
              duration: Duration(seconds: 1),
            ),
          );
        } catch (e) {
          // Revertir cambio si falla
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${e.toString()}')),
          );
        }
      },
    );
  }
}
```

### Estrategia 3: Edición Parcial con Bottom Sheet

Para ediciones rápidas de campos individuales:

```dart
void _showEditNameBottomSheet(BuildContext context, Project project) {
  final controller = TextEditingController(text: project.name);
  
  showModalBottomSheet(
    context: context,
    builder: (context) => Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: controller,
            decoration: InputDecoration(labelText: 'Nombre del proyecto'),
            autofocus: true,
          ),
          SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Cancelar'),
              ),
              ElevatedButton(
                onPressed: () async {
                  try {
                    await projectService.updateProject(
                      projectId: project.id,
                      updateDto: {'name': controller.text},
                    );
                    Navigator.pop(context);
                    // Recargar proyecto
                    _refreshProject();
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error: ${e.toString()}')),
                    );
                  }
                },
                child: Text('Guardar'),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}
```

## Validaciones en el Cliente

### Validaciones para Proyecto

```dart
class ProjectValidator {
  static String? validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'El nombre es requerido';
    }
    if (value.length > 255) {
      return 'El nombre no puede exceder 255 caracteres';
    }
    return null;
  }
  
  static String? validateBudget(String? value) {
    if (value == null || value.isEmpty) return null; // Opcional
    final budget = double.tryParse(value);
    if (budget == null) {
      return 'El presupuesto debe ser un número válido';
    }
    if (budget < 0) {
      return 'El presupuesto no puede ser negativo';
    }
    return null;
  }
  
  static String? validateFinalDate(DateTime? date, DateTime? startDate) {
    if (date == null) return null; // Opcional
    if (startDate != null && date.isBefore(startDate)) {
      return 'La fecha final debe ser posterior a la fecha de inicio';
    }
    return null;
  }
}
```

### Validaciones para Task

```dart
class TaskValidator {
  static String? validateDates(DateTime? startDate, DateTime? endDate) {
    if (startDate == null || endDate == null) {
      return 'Ambas fechas son requeridas';
    }
    if (endDate.isBefore(startDate)) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    return null;
  }
  
  static String? validateIncentivePoints(String? value) {
    if (value == null || value.isEmpty) return null; // Opcional
    final points = int.tryParse(value);
    if (points == null) {
      return 'Los puntos deben ser un número válido';
    }
    if (points < 0) {
      return 'Los puntos no pueden ser negativos';
    }
    return null;
  }
}
```

## Manejo de Errores

### Errores Comunes y Cómo Manejarlos

```dart
Future<void> updateProject(UpdateProjectDto dto) async {
  try {
    final updated = await projectService.updateProject(
      projectId: projectId,
      updateDto: dto,
    );
    return updated;
  } on UnauthorizedException {
    // Token expirado
    Navigator.pushReplacementNamed(context, '/login');
    throw Exception('Sesión expirada. Por favor, inicia sesión nuevamente.');
  } on NotFoundException {
    // Proyecto no encontrado (puede haber sido eliminado)
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('El proyecto ya no existe')),
    );
    throw Exception('Proyecto no encontrado');
  } on ForbiddenException {
    // Sin permisos
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('No tienes permiso para editar este proyecto')),
    );
    throw Exception('Sin permisos');
  } on ValidationException catch (e) {
    // Errores de validación del backend
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error de validación: ${e.message}')),
    );
    throw e;
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

## Optimistic Updates (Actualizaciones Optimistas)

Para mejorar la UX, puedes actualizar la UI inmediatamente antes de recibir la respuesta del servidor:

```dart
Future<void> toggleChecklistItem(ChecklistItem item, bool newValue) async {
  // 1. Actualizar UI inmediatamente (optimistic update)
  setState(() {
    item.isChecked = newValue;
  });
  
  try {
    // 2. Enviar actualización al servidor
    final updated = await checklistItemService.updateChecklistItem(
      taskId: item.taskId!,
      checklistItemId: item.id,
      isChecked: newValue,
    );
    
    // 3. Actualizar con datos del servidor (por si hay cambios adicionales)
    setState(() {
      // Reemplazar item con el actualizado del servidor
      final index = checklistItems.indexOf(item);
      checklistItems[index] = updated;
    });
    
    // 4. Recargar task, milestone, proyecto (en background)
    _refreshRelatedData();
  } catch (e) {
    // 5. Revertir cambio si falla
    setState(() {
      item.isChecked = !newValue;
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error al actualizar: ${e.toString()}')),
    );
  }
}
```

## Consideraciones de UX

### 1. Indicadores de Carga

Muestra indicadores de carga durante las actualizaciones:

```dart
bool _isSaving = false;

Future<void> _saveChanges() async {
  setState(() => _isSaving = true);
  
  try {
    await projectService.updateProject(...);
    // ...
  } finally {
    setState(() => _isSaving = false);
  }
}

// En el widget
if (_isSaving) {
  return CircularProgressIndicator();
}
```

### 2. Confirmación para Cambios Importantes

Para cambios que puedan afectar significativamente (como cambiar fechas de tasks):

```dart
Future<bool> _confirmDateChange() async {
  return await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text('Confirmar cambio de fecha'),
      content: Text('¿Estás seguro de que quieres cambiar la fecha? Esto puede afectar el progreso del proyecto.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(context, true),
          child: Text('Confirmar'),
        ),
      ],
    ),
  ) ?? false;
}
```

### 3. Deshabilitar Edición Durante Operaciones

```dart
bool get canEdit => !_isLoading && !_isSaving;

// En los campos
TextField(
  enabled: canEdit,
  // ...
)
```

### 4. Auto-guardado (Opcional)

Para formularios largos, considera auto-guardar después de un período de inactividad:

```dart
Timer? _autoSaveTimer;

void _onFieldChanged() {
  _autoSaveTimer?.cancel();
  _autoSaveTimer = Timer(Duration(seconds: 2), () {
    _saveChanges(silent: true); // Guardar sin mostrar mensaje
  });
}
```

## Modelos de Datos para Actualización

### DTOs de Actualización

```dart
class UpdateProjectDto {
  final String? name;
  final String? description;
  final String? purpose;
  final double? budget;
  final String? finalDate; // ISO date string
  final Map<String, dynamic>? resourcesAvailable;
  final Map<String, dynamic>? resourcesNeeded;
  
  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (description != null) 'description': description,
      if (purpose != null) 'purpose': purpose,
      if (budget != null) 'budget': budget,
      if (finalDate != null) 'finalDate': finalDate,
      if (resourcesAvailable != null) 'resourcesAvailable': resourcesAvailable,
      if (resourcesNeeded != null) 'resourcesNeeded': resourcesNeeded,
    };
  }
}

class UpdateMilestoneDto {
  final String? name;
  final String? description;
  
  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (description != null) 'description': description,
    };
  }
}

class UpdateTaskDto {
  final String? name;
  final String? description;
  final String? startDate; // ISO date string
  final String? endDate; // ISO date string
  final Map<String, dynamic>? resourcesAvailable;
  final Map<String, dynamic>? resourcesNeeded;
  final int? incentivePoints;
  
  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (description != null) 'description': description,
      if (startDate != null) 'startDate': startDate,
      if (endDate != null) 'endDate': endDate,
      if (resourcesAvailable != null) 'resourcesAvailable': resourcesAvailable,
      if (resourcesNeeded != null) 'resourcesNeeded': resourcesNeeded,
      if (incentivePoints != null) 'incentivePoints': incentivePoints,
    };
  }
}

class UpdateChecklistItemDto {
  final String? description;
  final bool? isRequired;
  final bool? isChecked;
  
  Map<String, dynamic> toJson() {
    return {
      if (description != null) 'description': description,
      if (isRequired != null) 'isRequired': isRequired,
      if (isChecked != null) 'isChecked': isChecked,
    };
  }
}
```

## Ejemplo Completo de Implementación

```dart
class EditProjectScreen extends StatefulWidget {
  final Project project;
  
  @override
  _EditProjectScreenState createState() => _EditProjectScreenState();
}

class _EditProjectScreenState extends State<EditProjectScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  late TextEditingController _purposeController;
  late TextEditingController _budgetController;
  DateTime? _finalDate;
  bool _isSaving = false;
  
  @override
  void initState() {
    super.initState();
    _initializeControllers();
  }
  
  void _initializeControllers() {
    _nameController = TextEditingController(text: widget.project.name);
    _descriptionController = TextEditingController(
      text: widget.project.description ?? '',
    );
    _purposeController = TextEditingController(
      text: widget.project.purpose ?? '',
    );
    _budgetController = TextEditingController(
      text: widget.project.budget?.toString() ?? '',
    );
    _finalDate = widget.project.finalDate;
  }
  
  Future<void> _saveChanges() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isSaving = true);
    
    try {
      final updateDto = UpdateProjectDto(
        name: _nameController.text != widget.project.name 
          ? _nameController.text 
          : null,
        description: _descriptionController.text != (widget.project.description ?? '')
          ? _descriptionController.text
          : null,
        purpose: _purposeController.text != (widget.project.purpose ?? '')
          ? _purposeController.text
          : null,
        budget: _budgetController.text.isNotEmpty 
          ? double.tryParse(_budgetController.text)
          : null,
        finalDate: _finalDate != widget.project.finalDate
          ? _finalDate?.toIso8601String().split('T')[0]
          : null,
      );
      
      final updatedProject = await projectService.updateProject(
        projectId: widget.project.id,
        updateDto: updateDto.toJson(),
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Proyecto actualizado exitosamente')),
        );
        Navigator.pop(context, updatedProject);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }
  
  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _finalDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(Duration(days: 365 * 5)),
    );
    
    if (picked != null) {
      setState(() => _finalDate = picked);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Editar Proyecto'),
        actions: [
          if (_isSaving)
            Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            IconButton(
              icon: Icon(Icons.save),
              onPressed: _saveChanges,
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Nombre *',
                border: OutlineInputBorder(),
              ),
              enabled: !_isSaving,
              validator: ProjectValidator.validateName,
            ),
            SizedBox(height: 16),
            TextFormField(
              controller: _descriptionController,
              decoration: InputDecoration(
                labelText: 'Descripción',
                border: OutlineInputBorder(),
              ),
              enabled: !_isSaving,
              maxLines: 3,
            ),
            SizedBox(height: 16),
            TextFormField(
              controller: _purposeController,
              decoration: InputDecoration(
                labelText: 'Propósito',
                border: OutlineInputBorder(),
              ),
              enabled: !_isSaving,
              maxLines: 2,
            ),
            SizedBox(height: 16),
            TextFormField(
              controller: _budgetController,
              decoration: InputDecoration(
                labelText: 'Presupuesto',
                border: OutlineInputBorder(),
                prefixText: '\$ ',
              ),
              enabled: !_isSaving,
              keyboardType: TextInputType.numberWithOptions(decimal: true),
              validator: ProjectValidator.validateBudget,
            ),
            SizedBox(height: 16),
            ListTile(
              title: Text('Fecha Final'),
              subtitle: Text(
                _finalDate != null
                  ? DateFormat('yyyy-MM-dd').format(_finalDate!)
                  : 'No seleccionada',
              ),
              trailing: Icon(Icons.calendar_today),
              onTap: _isSaving ? null : _selectDate,
            ),
          ],
        ),
      ),
    );
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _purposeController.dispose();
    _budgetController.dispose();
    super.dispose();
  }
}
```

## Notas Finales

1. **Solo envía campos que han cambiado** para optimizar el uso de datos
2. **Recarga datos relacionados** después de actualizaciones que afecten estados
3. **Usa optimistic updates** para mejor UX en operaciones frecuentes (como marcar checklist items)
4. **Valida en el cliente** antes de enviar para mejor experiencia
5. **Maneja errores apropiadamente** y proporciona feedback claro al usuario
6. **No intentes editar campos que no son editables** (status, rewardId, etc.)
7. **Considera usar debouncing** para auto-guardado en formularios largos
8. **Muestra indicadores de carga** durante operaciones asíncronas