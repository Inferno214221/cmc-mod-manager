/* eslint-disable @stylistic/js/max-len */
export default {
    operation: {
        update: {
            download: {
                started: {
                    title: "Descargar actualización",
                    body: "Descargando la versión más reciente de CMC Mod Manager.",
                },
                finished: {
                    title: "Actualización descargada",
                    body: "Versión más reciente de CMC Mod Manager descargada."
                }
            },
            install: {
                started: {
                    title: "Instalar actualización",
                    body: "Instalando la versión más reciente de CMC Mod Manager."
                },
                finished: {
                    body: "Cierre CMC Mod Manager para completar la actualización."
                }
            }
        },
        mod: {
            download: {
                started: {
                    title: "Descargar mod",
                    body: "Descargando un mod de GameBanana."
                },
                progress: {
                    0: {
                        title: "Descarga de {0}",
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
                    title: "Instalación masiva de personajes",
                    body: "Seleccionando personajes para instalar en '{0}'."
                },
                finished: {
                    body: "Personajes seleccionados para instalación en '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Instalación de personaje",
                    body: "Instalando un personaje de {0}."
                },
                finished: {
                    body: "Personaje instalado: '{0}' de {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Selección de personaje",
                    body: "Alternando la habilidad para que el personaje: '{0}' sea seleccionado aleatoriamente."
                },
                finished: {
                    body: "Habilidad alternada para que el personaje: '{0}' sea seleccionado aleatoriamente."
                }
            },
            deletion: {
                started: {
                    title: "Eliminar personaje",
                    body: "Eliminando personaje: '{0}'."
                },
                finished: {
                    body: "Personaje eliminado: '{0}'."
                }
            },
            extraction: {
                started: {
                    title: "Extracción de personaje",
                    body: "Extrayendo personaje: '{0}'."
                },
                finished: {
                    body: "Personaje extraído: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Eliminar serie",
                    body: "Eliminando todos los personajes de la serie: '{0}'."
                },
                finished: {
                    body: "Todos los personajes de la serie eliminados: '{0}'."
                }
            }
        },
        stage: {
            bulkInstallation: {
                started: {
                    title: "Instalación masiva de escenarios",
                    body: "Seleccionando escenarios para instalar desde '{0}'."
                },
                finished: {
                    body: "Escenarios seleccionados para instalación desde '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Instalación de escenario",
                    body: "Instalando un escenario de {0}."
                },
                finished: {
                    body: "Escenario instalado: '{0}' de {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Selección de escenario",
                    body: "Alternando la habilidad para que el escenario: '{0}' sea seleccionado aleatoriamente."
                },
                finished: {
                    body: "Habilidad alternada para que el escenario: '{0}' sea seleccionado aleatoriamente."
                }
            },
            deletion: {
                started: {
                    title: "Eliminar escenario",
                    body: "Eliminando escenario: '{0}'."
                },
                finished: {
                    body: "Escenario eliminado: '{0}'."
                }
            },
            extraction: {
                started: {
                    title: "Extracción de escenario",
                    body: "Extrayendo escenario: '{0}'."
                },
                finished: {
                    body: "Escenario extraído: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Eliminar serie",
                    body: "Eliminando todos los escenarios de la serie: '{0}'."
                },
                finished: {
                    body: "Todos los escenarios de la serie eliminados: '{0}'."
                }
            }
        },
        alt: {
            include: {
                started: {
                    title: "Inclusión de alternativos",
                    body: "Asegurando que los personajes alternativos estén incluidos en la lista de personajes."
                },
                finished: {
                    body: "Se aseguró que los personajes alternativos fueron incluidos en la lista de personajes."
                }
            },
            exclude: {
                started: {
                    title: "Exclusión de alternativos",
                    body: "Asegurando que los personajes alternativos sean excluidos de la lista de personajes."
                },
                finished: {
                    body: "Se aseguró que los personajes alternativos fueran excluidos de la lista de personajes."
                }
            },
            removal: {
                started: {
                    title: "Remoción de alternativo",
                    body: "Eliminando personaje alternativo: '{0}' del personaje: '{1}'."
                },
                finished: {
                    body: "Personaje alternativo eliminado: '{0}' del personaje: '{1}'."
                }
            },
            addition: {
                started: {
                    title: "Añadir alternativo",
                    body: "Añadiendo personaje alternativo: '{0}' al personaje: '{1}'."
                },
                finished: {
                    body: "Personaje alternativo añadido: '{0}' al personaje: '{1}'."
                }
            }
        },
        css: {
            writeData: {
                started: {
                    title: "Escribir datos CSS",
                    body: "Grabando datos CSS modificados en la página: '{0}'."
                },
                finished: {
                    body: "Datos CSS modificados grabados en la página: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Reordenar páginas CSS",
                    body: "Moviendo página CSS: '{0}' al índice: {1}."
                },
                finished: {
                    body: "Página CSS movida: '{0}' al índice: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "Añadir página CSS",
                    body: "Añadiendo nueva página CSS: '{0}'."
                },
                finished: {
                    body: "Nueva página CSS añadida: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Renombrar página CSS",
                    body: "Renombrando página CSS: '{0}' a '{1}'."
                },
                finished: {
                    body: "Página CSS renombrada: '{0}' a '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "Eliminar página CSS",
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
                    title: "Escribir datos SSS",
                    body: "Grabando datos SSS modificados en la página: '{0}'."
                },
                finished: {
                    body: "Datos SSS modificados grabados en la página: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Reordenar páginas SSS",
                    body: "Moviendo página SSS: '{0}' al índice: {1}."
                },
                finished: {
                    body: "Página SSS movida: '{0}' al índice: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "Añadir página SSS",
                    body: "Añadiendo nueva página SSS: '{0}'."
                },
                finished: {
                    body: "Nueva página SSS añadida: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Renombrar página SSS",
                    body: "Renombrando página SSS: '{0}' a '{1}'."
                },
                finished: {
                    body: "Página SSS renombrada: '{0}' a '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "Eliminar página SSS",
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
                title: "Advertencia de ubicación de juego inválida",
                body: "El directorio de juego seleccionado está dentro de la carpeta de CMC Mod Manager. CMC Mod Manager elimina TODOS los archivos de esta carpeta durante actualizaciones, por lo que NO puede usarse para almacenar sus archivos de juego. Por favor, muévalos a otra ubicación."
            },
            invalidGameDir: {
                title: "Directorio seleccionado inválido",
                body: "El directorio seleccionado es inválido porque no contiene uno de los archivos ejecutables de identificación."
            },
            postUpdate: {
                title: "Mensaje post-actualización",
                body: "¡Gracias por actualizar CMC Mod Manager! El sitio web de CMC Mod Manager también ha sido actualizado, considere visitarlo: https://inferno214221.com/cmc-mod-manager/ (un enlace también está disponible en la pestaña 'Inicio'). ¡También he creado una página en 'Buy Me A Coffee' si desea apoyar el proyecto!"
            },
            noDirSelected: {
                title: "Ningún directorio seleccionado",
                body: "Seleccione su directorio CMC+ antes de continuar."
            },
            languageUpdated: {
                title: "Idioma Actualizado",
                body: "Cierre y reinicie CMC Mod Manager para aplicar los cambios. ¡Gracias a SpringTrap Crusader por la traducción!"
            },
            licenseNotice: {
                title: "Aviso de licencia",
            }
        },
        confirm: {
            programUpdate: {
                title: "Actualización del programa",
                body: "CMC Mod Manager requiere una actualización. Esta actualización se instalará automáticamente. Advertencia: esta actualización eliminará todos los archivos del directorio de CMC Mod Manager. Si esto es problemático, cancele la actualización y elimine manualmente los archivos afectados.",
                okLabel: "Continuar"
            },
            destructiveAction: {
                title: "Confirmación de acción destructiva",
                body: "Esta acción es destructiva y no puede deshacerse. ¿Está seguro de que desea continuar?",
                okLabel: "Continuar"
            },
            closeUnfinishedOperations: {
                title: "Operaciones incompletas",
                body: "¿Está seguro de que desea cerrar CMC Mod Manager? Algunas operaciones aún están en curso y se cancelarán si cierra (o recarga) el programa.",
                okLabel: "Cerrar de todos modos"
            },
            beginCharacterInput: {
                title: "Instalación de personaje",
                body: "El archivo .dat del personaje que se está instalando utiliza el formato vanilla, y será necesario proporcionar información para la instalación. Esta información generalmente puede encontrarse en un archivo .txt en el directorio principal del mod.",
                okLabel: "Continuar"
            },
            openCharacterDir: {
                title: "Instalación de personaje",
                body: "¿Desea abrir el directorio del mod para buscar archivos .txt manualmente?",
                okLabel: "Sí",
                cancelLabel: "No"
            },
            beginStageInput: {
                title: "Instalación de escenario",
                body: "Debido al formato actual de modding de CMC+, será necesario ingresar información sobre el escenario que está instalando. Esta información generalmente puede encontrarse en un archivo .txt en el directorio principal del mod. (Si este archivo .txt existe y contiene cuatro líneas, la primera probablemente sea innecesaria.)",
                okLabel: "Continuar"
            },
            openStageDir: {
                title: "Instalación de escenario",
                body: "¿Desea abrir el directorio del mod para buscar archivos .txt manualmente?",
                okLabel: "Sí",
                cancelLabel: "No"
            }
        },
        prompt: {
            characterMenuName: {
                title: "Instalación de personaje",
                body: "Por favor, ingrese el 'nombre en menú' del personaje. (Este es el nombre mostrado cuando el personaje es seleccionado en la pantalla de selección de personajes.)",
                placeholder: "Nombre del personaje en menú"
            },
            characterBattleName: {
                title: "Instalación de personaje",
                body: "Por favor, ingrese el 'nombre en batalla' del personaje. (Este es el nombre mostrado como parte del HUD durante un combate.)",
                placeholder: "Nombre del personaje en batalla",
            },
            characterSeries: {
                title: "Instalación de personaje",
                body: "Por favor, ingrese la 'serie' del personaje. (Este nombre se usará para seleccionar el ícono en la pantalla de selección de personajes. Normalmente es un valor corto en minúsculas.)",
                placeholder: "Serie del personaje",
            },
            stageMenuName: {
                title: "Instalación de escenario",
                body: "Por favor, ingrese el 'nombre en menú' del escenario. (El nombre que se mostrará en la pantalla de selección de escenarios.)",
                placeholder: "Nombre del escenario en menú"
            },
            stageSource: {
                title: "Instalación de escenario",
                body: "Por favor, ingrese la 'fuente' del escenario. (El nombre del contenido original del que proviene el escenario, como el título del juego.)",
                placeholder: "Fuente del escenario",
            },
            stageSeries: {
                title: "Instalación de escenario",
                body: "Por favor, ingrese la 'serie' del escenario. (Este nombre se usará para seleccionar el ícono en la pantalla de selección de escenarios. Normalmente es un valor corto en minúsculas.)",
                placeholder: "Serie del escenario",
            }
        },
        defaults: {
            okLabel: "Aceptar",
            cancelLabel: "Cancelar"
        },
        notification: {
            oneClickDownload: {
                title: "Descarga en 1 clic iniciada",
                body: "Descargando mod con ID: '{0}' de GameBanana."
            }
        },
        installation: {
            character: {
                title: "Seleccione personajes para instalar"
            },
            stage: {
                title: "Seleccione escenarios para instalar"
            }
        }
    },
    error: {
        noStringFound: "No se pudo obtener la cadena para la clave: '{0}'.",
        invalidStringArgs: "Número inválido de argumentos al sustituir en la cadena.",
        missingDialogOptions: "Opciones de diálogo no encontradas.",
        unsupportedArchiveType: "Tipo de archivo no soportado: '{0}'.",
        unknownModType: "Tipo de mod desconocido: '{0}'.",
        invalidSemverString: "Cadena semver inválida: '{0}'.",
        cantUpdateDevMode: "No se puede actualizar en modo desarrollo.",
        missingUpdateFiles: "Archivos de actualización no encontrados.",
        streamError: "Ocurrió un error de flujo: '{0}'.",
        noSingleInstanceLock: "Fallo en el bloqueo de instancia única.",
        noRecursiveAlts: "Un personaje con alternativos no puede asignarse como alternativo.",
        maxAltsReached: "El personaje ya tiene el número máximo de alternativos.",
        characterNotFound: "Personaje no encontrado: '{0}'.",
        stageNotFound: "Escenario no encontrado: '{0}'.",
        incompleteDat: "Archivo dat del personaje incompleto: '{0}'.",
        characterInstallTargetSelf: "No se pueden instalar personajes desde el mismo directorio de destino.",
        stageInstallTargetSelf: "No se pueden instalar escenarios desde el mismo directorio de destino.",
        noValidCharactersFound: "No se encontraron personajes válidos en el directorio: '{0}'.",
        noValidStagesFound: "No se encontraron escenarios válidos en el directorio: '{0}'.",
        noTopDir: "La ruta del archivo no tiene directorio: '{0}'.",
        noFighterSubdir: "No se encontró subdirectorio 'fighter' en: '{0}'.",
        noStageSubdir: "No se encontró subdirectorio 'stage' en: '{0}'.",
        noUpdateCharacter: "Personaje ya instalado, actualizaciones deshabilitadas.",
        noUpdateStage: "Escenario ya instalado, actualizaciones deshabilitadas.",
        noDatFile: "El personaje no tiene archivo dat.",
        customCssDisabled: "Páginas CSS personalizadas deshabilitadas en game_settings.",
        operationCallNotFound: "Función de operación no encontrada: '{0}'."
    },
    tooltip: {
        character: {
            install: "Instalar personaje",
            update: "Actualizar personaje",
            search: "Buscar personaje",
            installDir: "Instalar personaje desde directorio",
            installArch: "Instalar personaje desde archivo",
            delete: "Eliminar personaje",
            extract: "Extraer personaje",
            deleteSeries: "Eliminar todos los personajes de la serie",
            showing: {
                all: "Mostrando: Todos los personajes",
                new: "Mostrando: Nuevos personajes",
                excluded: "Mostrando: Personajes excluidos"
            },
            existing: {
                update: "Personajes existentes: Actualizar",
                abort: "Personajes existentes: Abortar"
            }
        },
        stage: {
            install: "Instalar escenario",
            update: "Actualizar escenario",
            search: "Buscar escenario",
            installDir: "Instalar escenario desde directorio",
            installArch: "Instalar escenario desde archivo",
            delete: "Eliminar escenario",
            extract: "Extraer escenario",
            deleteSeries: "Eliminar todos los escenarios de la serie",
            showing: {
                all: "Mostrando: Todos los escenarios",
                new: "Mostrando: Nuevos escenarios",
                excluded: "Mostrando: Escenarios excluidos"
            },
            existing: {
                update: "Escenarios existentes: Actualizar",
                abort: "Escenarios existentes: Abortar"
            }
        },
        alt: {
            remove: "Eliminar alternativos",
            addition: {
                toThis: "Añadir personaje alternativo a este personaje",
                thisFor: "Añadir como personaje alternativo al personaje seleccionado",
                cancel: "Cancelar adición de personaje alternativo"
            },
            asCharacters: {
                included: "Alternativos: Incluidos como personajes",
                excluded: "Alternativos: Excluidos de personajes"
            }
        },
        ss: {
            addPage: "Añadir página",
            deletePage: "Eliminar página",
            column: {
                add: "Añadir columna",
                remove: "Eliminar columna"
            },
            row: {
                add: "Añadir fila",
                remove: "Eliminar fila"
            }
        },
        sortBy: {
            number: "Ordenar por: Número interno",
            series: "Ordenar por: Serie",
            alphabetical: "Ordenar por: Orden alfabético"
        },
        sortDirection: {
            backwards: "Dirección de orden: Hacia atrás",
            forwards: "Dirección de orden: Hacia adelante"
        },
        installation: {
            filter: "Instalación: Solo archivos necesarios",
            all: "Instalación: Todos los archivos"
        },
        randomSelection: {
            enabled: "Selección aleatoria: Activada",
            disabled: "Selección aleatoria: Desactivada"
        },
        operationPanel: {
            show: "Mostrar operaciones",
            hide: "Ocultar operaciones"
        },
        operation: {
            cancel: "Cancelar operación"
        },
        gameDir: {
            noneSelected: "(Ninguno seleccionado)",
            change: "Cambiar directorio de CMC+",
            open: "Abrir directorio de CMC+",
            run: "Ejecutar CMC+"
        },
        site: {
            homepage: "Página principal"
        },
        closeWindow: "Cerrar ventana",
        openExtractionDir: "Abrir directorio de extracción",
        openExtractedFiles: "Abrir archivos extraídos"
    },
    ui: {
        tabs: {
            home: {
                title: "Inicio"
            },
            characters: {
                title: "Personajes",
                desc: "Instalar, extraer o eliminar personajes de CMC+."
            },
            characterSelectionScreen: {
                title: "Pantalla de selección de personajes",
                desc: "Modificar la pantalla de selección de personajes de CMC+."
            },
            stages: {
                title: "Escenarios",
                desc: "Instalar, extraer o eliminar escenarios de CMC+."
            },
            stageSelectionScreen: {
                title: "Pantalla de selección de escenarios",
                desc: "Modificar la pantalla de selección de escenarios de CMC+."
            }
        },
        currentGameDir: "Directorio Actual de CMC+: ",
        searchPlaceholder: "Buscar",
        pagePlaceholder: "Nombre de página",
        showLicense: "Mostrar licencia (GNU GPLv3)",
        errorDisplay: "Un error mostrado aquí indica que no está asociado a una operación y está impidiendo que se muestre la pestaña.",
        operations: "Operaciones"
    },
    enumDisplayName: {
        character: "Personaje",
        stage: "Escenario"
    },
    other: {
        dat: {
            homeStages: "---Escenarios de Inicio (Modo clásico)---",
            randomData: "---Otra Información---",
            paletteNumber: "---Numero de Paleta---",
            paletteData: "---Datos de Pyaleta---",
            formatUpdated: "Actualizado al formato dat de CMC+ v8 por CMC Mod Manager.",
        },
        selector: {
            archives: "Archivos",
            all: "Todos los archivos"
        },
        autoUpdateFailed: "Debido a cómo se instaló CMC Mod Manager, no se puede actualizar automáticamente. Por favor, descargue la versión más reciente manualmente desde GitHub o GameBanana. (Consulte la pestaña 'Inicio' para los enlaces.)",
        defaultPageName: "Predeterminado",
        languageName: "Español (Spanish)",
        by: "de"
    }
};