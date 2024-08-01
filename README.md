# APEX Migrations

APEX Migrations es una extensión para Visual Studio Code que facilita la gestión de migraciones de bases de datos APEX.

## Características

- Detecta cambios en el directorio `database`.
- Crea scripts de migración automáticamente.
- Gestiona scripts de instalación y rollback.
- Actualiza automáticamente el changelog de Liquibase.

## Uso

### Crear una nueva migración

1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P` en macOS).
2. Ejecuta el comando `APEX Migrations: Create Migration`.
3. Ingresa el número de caso de Axosoft.
4. Confirma los datos suministrados.
5. Se generará un script de migración e incluirá las modificaciones detectadas en el directorio `database`.

### Detectar cambios en la base de datos

1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P` en macOS).
2. Ejecuta el comando `APEX Migrations: Detect Changes in Database`.
3. Ingresa el número de caso de Axosoft.
4. Se generará un script de migración con los cambios detectados y se actualizará el changelog de Liquibase.

## Contribuir

Si deseas contribuir a este proyecto, por favor sigue las siguientes instrucciones:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -am 'Agrega nueva funcionalidad'`).
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un pull request.

## Licencia

Este proyecto está licenciado bajo los términos de la licencia MIT. Consulta el archivo `LICENSE` para más información.


