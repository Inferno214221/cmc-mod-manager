/* eslint-disable @stylistic/js/max-len */
export default {
    operation: {
        update: {
            download: {
                started: {
                    title: "Descargar Actualización",
                    body: "Descargando la versión más reciente de CMC Mod Manager.",
                },
                finished: {
                    title: "Actualización Descargada",
                    body: "Descargada la versión más reciente de CMC Mod Manager."
                }
            },
            install: {
                started: {
                    title: "Instalar Actualización",
                    body: "Instalando la versión más reciente de CMC Mod Manager."
                },
                finished: {
                    body: "Por favor, cierre CMC Mod Manager para completar la actualización."
                }
            }
        },
        mod: {
            download: {
                started: {
                    title: "Descargar Mod",
                    body: "Descargando un mod de GameBanana."
                },
                progress: {
                    0: {
                        title: "Descargando {0}",
                        body: "Descargando mod: '{0}' de GameBanana.",
                    },
                    1: {
                        body: "Extrayendo mod descargado.",
                    },
                },
                finished: {
                    body: "Mod descargado: '{0}' de GameBanana."
                }
            }
        },
        character: {
            bulkInstallation: {
                started: {
                    title: "Instalación en Lote de Personajes",
                    body: "Seleccionando personajes para instalar de '{0}'."
                },
                finished: {
                    body: "Personajes seleccionados para instalar de '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Instalación de Personaje",
                    body: "Instalando un personaje de {0}."
                },
                finished: {
                    body: "Personaje instalado: '{0}' de {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Selección de Personaje",
                    body: "Alternando la posibilidad del personaje: '{0}' de ser seleccionado aleatoriamente."
                },
                finished: {
                    body: "Alternada la posibilidad del personaje: '{0}' de ser seleccionado aleatoriamente."
                }
            },
            deletion: {
                started: {
                    title: "Eliminación de Personaje",
                    body: "Eliminando personaje: '{0}'."
                },
                finished: {
                    body: "Personaje eliminado: '{0}'."
                }
            },
            extraction: {
                started: {
                    title: "Extracción de Personaje",
                    body: "Extrayendo personaje: '{0}'."
                },
                finished: {
                    body: "Personaje extraído: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Eliminación de Serie",
                    body: "Eliminando todos los personajes de la serie: '{0}'."
                },
                finished: {
                    body: "Todos los personajes de la serie: '{0}' fueron eliminados."
                }
            }
        },
        stage: {
            bulkInstallation: {
                started: {
                    title: "Instalación en Lote de Escenarios",
                    body: "Seleccionando escenarios para instalar de '{0}'."
                },
                finished: {
                    body: "Escenarios seleccionados para instalar de '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Instalación de Escenario",
                    body: "Instalando un escenario de {0}."
                },
                finished: {
                    body: "Escenario instalado: '{0}' de {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Selección de Escenario",
                    body: "Alternando la posibilidad del escenario: '{0}' de ser seleccionado aleatoriamente."
                },
                finished: {
                    body: "Alternada la posibilidad del escenario: '{0}' de ser seleccionado aleatoriamente."
                }
            },
            deletion: {
                started: {
                    title: "Eliminación de Escenario",
                    body: "Eliminando escenario: '{0}'."
                },
                finished: {
                    body: "Escenario eliminado: '{0}'."
                }
            },
            extraction: {
                started: {
                    title: "Extracción de Escenario",
                    body: "Extrayendo escenario: '{0}'."
                },
                finished: {
                    body: "Escenario extraído: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Eliminación de Serie",
                    body: "Eliminando todos los escenarios de la serie: '{0}'."
                },
                finished: {
                    body: "Todos los escenarios de la serie: '{0}' fueron eliminados."
                }
            }
        },
        alt: {
            include: {
                started: {
                    title: "Inclusión de Alternativos",
                    body: "Asegurando que los alternativos sean incluidos en la lista de personajes."
                },
                finished: {
                    body: "Asegurado que los alternativos sean incluidos en la lista de personajes."
                }
            },
            exclude: {
                started: {
                    title: "Exclusión de Alternativos",
                    body: "Asegurando que los alternativos sean excluidos de la lista de personajes."
                },
                finished: {
                    body: "Asegurado que los alternativos sean excluidos de la lista de personajes."
                }
            },
            removal: {
                started: {
                    title: "Eliminación de Alternativo",
                    body: "Eliminando alternativo: '{0}' del personaje: '{1}'."
                },
                finished: {
                    body: "Alternativo eliminado: '{0}' del personaje: '{1}'."
                }
            },
            addition: {
                started: {
                    title: "Adición de Alternativo",
                    body: "Añadiendo alternativo: '{0}' al personaje: '{1}'."
                },
                finished: {
                    body: "Alternativo añadido: '{0}' al personaje: '{1}'."
                }
            }
        },
        css: {
            writeData: {
                started: {
                    title: "Guardar Datos CSS",
                    body: "Guardando datos CSS modificados en la página: '{0}'."
                },
                finished: {
                    body: "Datos CSS modificados guardados en la página: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Reordenar Páginas CSS",
                    body: "Moviendo página CSS: '{0}' a la posición: {1}."
                },
                finished: {
                    body: "Página CSS: '{0}' movida a la posición: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "Adición de Página CSS",
                    body: "Añadiendo nueva página CSS: '{0}'."
                },
                finished: {
                    body: "Nueva página CSS añadida: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Renombrar Página CSS",
                    body: "Renombrando página CSS: '{0}' a '{1}'."
                },
                finished: {
                    body: "Página CSS renombrada: '{0}' a '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "Eliminación de Página CSS",
                    body: "Eliminando página CSS: '{0}'."
                },
                finished: {
                    body: "Página CSS eliminada: '{0}'."
                }
            }
        },
        sss: {
            writeData: {
                started: {
                    title: "Guardar Datos SSS",
                    body: "Guardando datos SSS modificados en la página: '{0}'."
                },
                finished: {
                    body: "Datos SSS modificados guardados en la página: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Reordenar Páginas SSS",
                    body: "Moviendo página SSS: '{0}' a la posición: {1}."
                },
                finished: {
                    body: "Página SSS: '{0}' movida a la posición: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "Adición de Página SSS",
                    body: "Añadiendo nueva página SSS: '{0}'."
                },
                finished: {
                    body: "Nueva página SSS añadida: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Renombrar Página SSS",
                    body: "Renombrando página SSS: '{0}' a '{1}'."
                },
                finished: {
                    body: "Página SSS renombrada: '{0}' a '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "Eliminación de Página SSS",
                    body: "Eliminando página SSS: '{0}'."
                },
                finished: {
                    body: "Página SSS eliminada: '{0}'."
                }
            }
        }
    },
    dialog: {
        alert: {
            selfContainedDir: {
                title: "Alerta de Ubicación de Juego Inválida",
                body: "El directorio de juego seleccionado está contenido dentro del propio directorio de CMC Mod Manager. CMC Mod Manager elimina todos los archivos de este directorio al actualizar, por lo que no puede usarse para almacenar sus archivos de juego. Por favor, muévalos a una ubicación diferente."
            },
            invalidGameDir: {
                title: "Directorio Inválido Seleccionado",
                body: "El directorio seleccionado es inválido, ya que no contiene uno de los ejecutables de identificación."
            },
            postUpdate: {
                title: "Mensaje Post-Actualización",
                body: "¡Gracias por actualizar CMC Mod Manager! El sitio web de CMC Mod Manager también ha sido actualizado, así que considere echarle un vistazo: https://inferno214221.com/cmc-mod-manager/ (también hay un enlace disponible en la pestaña 'Inicio'). ¡También he creado una página 'Buy Me A Coffee' si desea apoyar el proyecto!"
            },
            noDirSelected: {
                title: "Ningún Directorio Seleccionado",
                body: "Por favor, seleccione su directorio CMC+ antes de continuar."
            },
            languageUpdated: {
                title: "Idioma Actualizado",
                body: "Por favor, cierre y reinicie CMC Mod Manager para aplicar los cambios."
            },
            licenseNotice: {
                title: "Aviso de Licencia",
            }
        },
        confirm: {
            programUpdate: {
                title: "Actualización del Programa",
                body: "CMC Mod Manager necesita una actualización. Esta actualización se instalará automáticamente ahora. Eliminará todos los archivos dentro del directorio de CMC Mod Manager. Si esto es un problema, cancele esta actualización y elimine cualquier archivo afectado.",
                okLabel: "Continuar"
            },
            destructiveAction: {
                title: "Confirmación de Acción Destructiva",
                body: "Esta acción es destructiva y no se puede deshacer. ¿Está seguro de que desea continuar?",
                okLabel: "Continuar"
            },
            closeUnfinishedOperations: {
                title: "Operaciones Inacabadas",
                body: "¿Está seguro de que desea cerrar CMC Mod Manager? Algunas operaciones están en curso y se cancelarán si cierra (o recarga) el programa.",
                okLabel: "Cerrar de Todos Modos"
            },
            beginCharacterInput: {
                title: "Instalación de Personaje",
                body: "El archivo dat del personaje que se está instalando usa el formato vanilla y deberá ingresar información para la instalación. Esta información generalmente se puede encontrar en un archivo txt en el directorio principal del mod.",
                okLabel: "Continuar"
            },
            openCharacterDir: {
                title: "Instalación de Personaje",
                body: "¿Desea abrir el directorio del mod para buscar archivos txt manualmente?",
                okLabel: "Sí",
                cancelLabel: "No"
            },
            beginStageInput: {
                title: "Instalación de Escenario",
                body: "Debido al formato de modding actual de CMC+, deberá ingresar información sobre el escenario que está instalando. Esta información generalmente se puede encontrar en un archivo txt en el directorio principal del mod. (Si dicho archivo txt existe y contiene cuatro líneas, la primera probablemente sea innecesaria.)",
                okLabel: "Continuar"
            },
            openStageDir: {
                title: "Instalación de Escenario",
                body: "¿Desea abrir el directorio del mod para buscar archivos txt manualmente?",
                okLabel: "Sí",
                cancelLabel: "No"
            }
        },
        prompt: {
            characterMenuName: {
                title: "Instalación de Personaje",
                body: "Por favor, ingrese el 'nombre de menú' del personaje. (Este es el nombre que se muestra cuando el personaje es seleccionado en la pantalla de selección de personajes.)",
                placeholder: "Nombre de Menú del Personaje"
            },
            characterBattleName: {
                title: "Instalación de Personaje",
                body: "Por favor, ingrese el 'nombre de batalla' del personaje. (Este es el nombre que se muestra como parte del HUD durante una partida.)",
                placeholder: "Nombre de Batalla del Personaje",
            },
            characterSeries: {
                title: "Instalación de Personaje",
                body: "Por favor, ingrese la 'serie' del personaje. (Este nombre se usará para seleccionar el ícono a usar en la pantalla de selección de personajes. Este valor generalmente es corto y en letras minúsculas.)",
                placeholder: "Serie del Personaje",
            },
            stageMenuName: {
                title: "Instalación de Escenario",
                body: "Por favor, ingrese el 'nombre de menú' del escenario. (El nombre que se mostrará en la pantalla de selección de escenarios.)",
                placeholder: "Nombre de Menú del Escenario"
            },
            stageSource: {
                title: "Instalación de Escenario",
                body: "Por favor, ingrese el 'origen' del escenario. (El nombre del contenido de origen del escenario, como el título del juego.)",
                placeholder: "Origen del Escenario",
            },
            stageSeries: {
                title: "Instalación de Escenario",
                body: "Por favor, ingrese la 'serie' del escenario. (Este nombre se usará para seleccionar el ícono a usar en la pantalla de selección de escenarios. Este valor generalmente es corto y en letras minúsculas.)",
                placeholder: "Serie del Escenario",
            }
        },
        defaults: {
            okLabel: "OK",
            cancelLabel: "Cancelar"
        },
        notification: {
            oneClickDownload: {
                title: "Descarga con 1 Clic Iniciada",
                body: "Descargando mod con ID: '{0}' de GameBanana."
            }
        },
        installation: {
            character: {
                title: "Seleccionar Personajes para Instalar"
            },
            stage: {
                title: "Seleccionar Escenarios para Instalar"
            }
        }
    },
    error: {
        noStringFound: "No se pudo encontrar el texto para la clave: '{0}'.",
        invalidStringArgs: "Número inválido de argumentos al sustituir en el texto.",
        missingDialogOptions: "Opciones de diálogo no encontradas.",
        unsupportedArchiveType: "Tipo de archivo no soportado: '{0}'.",
        unknownModType: "Tipo de mod desconocido: '{0}'.",
        invalidSemverString: "Formato de versión inválido: '{0}'.",
        cantUpdateDevMode: "No se puede actualizar en modo de desarrollo.",
        missingUpdateFiles: "Archivos de actualización no encontrados.",
        streamError: "Ocurrió un error en la transferencia: '{0}'.",
        noSingleInstanceLock: "Fallo en el bloqueo de instancia única.",
        noRecursiveAlts: "Un personaje con alternativos no puede ser asignado como un alternativo.",
        maxAltsReached: "El personaje ya tiene el número máximo de alternativos.",
        characterNotFound: "Personaje no encontrado: '{0}'.",
        stageNotFound: "Escenario no encontrado: '{0}'.",
        incompleteDat: "Dat del personaje está incompleto: '{0}'.",
        characterInstallTargetSelf: "No se pueden instalar personajes desde el directorio al que se están instalando.",
        stageInstallTargetSelf: "No se pueden instalar escenarios desde el directorio al que se están instalando.",
        noValidCharactersFound: "No se encontraron personajes válidos en el directorio: '{0}'.",
        noValidStagesFound: "No se encontraron escenarios válidos en el directorio: '{0}'.",
        noTopDir: "La ruta del archivo no tiene directorio: '{0}'.",
        noFighterSubdir: "No se encontró el subdirectorio 'fighter' en el directorio: '{0}'.",
        noStageSubdir: "No se encontró el subdirectorio 'stage' en el directorio: '{0}'.",
        noUpdateCharacter: "Personaje ya instalado, actualizaciones desactivadas.",
        noUpdateStage: "Escenario ya instalado, actualizaciones desactivadas.",
        noDatFile: "El personaje no tiene archivo dat.",
        customCssDisabled: "Páginas CSS personalizadas desactivadas en game_settings.",
        operationCallNotFound: "Función de operación no encontrada: '{0}'."
    },
    tooltip: {
        character: {
            install: "Instalar Personaje",
            update: "Actualizar Personaje",
            search: "Buscar Personajes",
            installDir: "Instalar Personaje desde un Directorio",
            installArch: "Instalar Personaje desde un Archivo",
            delete: "Eliminar Personaje",
            extract: "Extraer Personaje",
            deleteSeries: "Eliminar Todos los Personajes de la Serie",
            showing: {
                all: "Mostrando: Todos los Personajes",
                new: "Mostrando: Personajes Nuevos",
                excluded: "Mostrando: Personajes Excluidos"
            },
            existing: {
                update: "Personajes Existentes: Actualizar",
                abort: "Personajes Existentes: Abortar"
            }
        },
        stage: {
            install: "Instalar Escenario",
            update: "Actualizar Escenario",
            search: "Buscar Escenarios",
            installDir: "Instalar Escenario desde un Directorio",
            installArch: "Instalar Escenario desde un Archivo",
            delete: "Eliminar Escenario",
            extract: "Extraer Escenario",
            deleteSeries: "Eliminar Todos los Escenarios de la Serie",
            showing: {
                all: "Mostrando: Todos los Escenarios",
                new: "Mostrando: Escenarios Nuevos",
                excluded: "Mostrando: Escenarios Excluidos"
            },
            existing: {
                update: "Escenarios Existentes: Actualizar",
                abort: "Escenarios Existentes: Abortar"
            }
        },
        alt: {
            remove: "Eliminar Alternativo",
            addition: {
                toThis: "Añadir Alternativo a Este Personaje",
                thisFor: "Añadir Este Personaje como Alternativo",
                cancel: "Cancelar Adición de Alternativo"
            },
            asCharacters: {
                included: "Alternativos: Incluidos Como Personajes",
                excluded: "Alternativos: Excluidos Como Personajes"
            }
        },
        ss: {
            addPage: "Añadir Página",
            deletePage: "Eliminar Página",
            column: {
                add: "Añadir Columna",
                remove: "Eliminar Columna"
            },
            row: {
                add: "Añadir Fila",
                remove: "Eliminar Fila"
            }
        },
        sortBy: {
            number: "Ordenar Por: Número Interno",
            series: "Ordenar Por: Serie",
            alphabetical: "Ordenar Por: Orden Alfabético"
        },
        sortDirection: {
            backwards: "Dirección de Ordenación: Inversa",
            forwards: "Dirección de Ordenación: Normal"
        },
        dragMode: {
            auto: "Modo de Arrastre: Automático",
            insert: "Modo de Arrastre: Insertar",
            swap: "Modo de Arrastre: Intercambiar"
        },
        installation: {
            filter: "Instalación: Solo Archivos Necesarios",
            all: "Instalación: Todos los Archivos"
        },
        randomSelection: {
            enabled: "Selección Aleatoria: Activada",
            disabled: "Selección Aleatoria: Desactivada"
        },
        operationPanel: {
            show: "Mostrar Operaciones",
            hide: "Ocultar Operaciones"
        },
        operation: {
            cancel: "Cancelar Operación"
        },
        gameDir: {
            noneSelected: "(Ninguno Seleccionado)",
            change: "Cambiar Directorio CMC+",
            open: "Abrir Directorio CMC+",
            run: "Ejecutar CMC+"
        },
        site: {
            homepage: "Inicio"
        },
        closeWindow: "Cerrar Ventana",
        openExtractionDir: "Abrir Directorio de Extracción",
        openExtractedFiles: "Abrir Archivos Extraídos"
    },
    ui: {
        tabs: {
            home: {
                title: "Inicio"
            },
            characters: {
                title: "Personajes",
                desc: "Instale, extraiga o elimine personajes de CMC+."
            },
            characterSelectionScreen: {
                title: "Pantalla de Selección de Personajes",
                desc: "Modifique la pantalla de selección de personajes de CMC+."
            },
            stages: {
                title: "Escenarios",
                desc: "Instale, extraiga o elimine escenarios de CMC+."
            },
            stageSelectionScreen: {
                title: "Pantalla de Selección de Escenarios",
                desc: "Modifique la pantalla de selección de escenarios de CMC+."
            }
        },
        currentGameDir: "Directorio CMC+ Actual: ",
        searchPlaceholder: "Buscar",
        pagePlaceholder: "Nombre de la Página",
        showLicense: "Mostrar Licencia (GNU GPLv3)",
        errorDisplay: "Un error mostrado aquí significa que no está asociado a una operación y está impidiendo que la pestaña se renderice.",
        operations: "Operaciones"
    },
    enumDisplayName: {
        character: "Personaje",
        stage: "Escenario"
    },
    other: {
        dat: {
            homeStages: "---Escenarios (Modo Clásico)---",
            randomData: "---Otra Información---",
            paletteNumber: "---Cantidad de Paletas---",
            paletteData: "---Datos de las Paletas---",
            formatUpdated: "Actualizado al formato dat de CMC+ v8 por CMC Mod Manager.",
        },
        selector: {
            archives: "Archivos",
            all: "Todos los Archivos",
        },
        autoUpdateFailed: "Debido a la forma en que CMC Mod Manager ha sido instalado, no se puede actualizar automáticamente. Por favor, descargue la versión más reciente de GitHub o GameBanana. (Consulte la pestaña Inicio para los enlaces.)",
        defaultPageName: "Predeterminado",
        languageName: "Español (Spanish)",
        by: "por"
    }
};