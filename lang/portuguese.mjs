/* eslint-disable @stylistic/js/max-len */
export default {
    operation: {
        update: {
            download: {
                started: {
                    title: "Baixar Atualização",
                    body: "Baixando a versão mais recente do CMC Mod Manager.",
                },
                finished: {
                    title: "Atualização Baixada",
                    body: "Baixada a versão mais recente do CMC Mod Manager."
                }
            },
            install: {
                started: {
                    title: "Instalar Atualização",
                    body: "Instalando a versão mais recente do CMC Mod Manager."
                },
                finished: {
                    body: "Por favor, feche o CMC Mod Manager para concluir a atualização."
                }
            }
        },
        mod: {
            download: {
                started: {
                    title: "Baixar Mod",
                    body: "Baixando um mod do GameBanana."
                },
                progress: {
                    0: {
                        title: "Baixando {0}",
                        body: "Baixando mod: '{0}' do GameBanana.",
                    },
                    1: {
                        body: "Extraindo mod baixado.",
                    },
                },
                finished: {
                    body: "Mod baixado: '{0}' do GameBanana."
                }
            }
        },
        character: {
            bulkInstallation: {
                started: {
                    title: "Instalação em Lote de Personagens",
                    body: "Selecionando personagens para instalar de '{0}'."
                },
                finished: {
                    body: "Personagens selecionados para instalar de '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Instalação de Personagem",
                    body: "Instalando um personagem de {0}."
                },
                finished: {
                    body: "Personagem instalado: '{0}' de {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Seleção de Personagem",
                    body: "Alternando a possibilidade do personagem: '{0}' ser selecionado aleatoriamente."
                },
                finished: {
                    body: "Alternada a possibilidade do personagem: '{0}' ser selecionado aleatoriamente."
                }
            },
            deletion: {
                started: {
                    title: "Exclusão de Personagem",
                    body: "Excluindo personagem: '{0}'."
                },
                finished: {
                    body: "Personagem excluído: '{0}'."
                }
            },
            extraction: {
                started: {
                    title: "Extração de Personagem",
                    body: "Extraindo personagem: '{0}'."
                },
                finished: {
                    body: "Personagem extraído: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Exclusão de Série",
                    body: "Excluindo todos os personagens da série: '{0}'."
                },
                finished: {
                    body: "Todos os personagens da série: '{0}' foram excluídos."
                }
            }
        },
        stage: {
            bulkInstallation: {
                started: {
                    title: "Instalação em Lote de Estágios",
                    body: "Selecionando estágios para instalar de '{0}'."
                },
                finished: {
                    body: "Estágios selecionados para instalar de '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Instalação de Estágio",
                    body: "Instalando um estágio de {0}."
                },
                finished: {
                    body: "Estágio instalado: '{0}' de {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Seleção de Estágio",
                    body: "Alternando a possibilidade do estágio: '{0}' ser selecionado aleatoriamente."
                },
                finished: {
                    body: "Alternada a possibilidade do estágio: '{0}' ser selecionado aleatoriamente."
                }
            },
            deletion: {
                started: {
                    title: "Exclusão de Estágio",
                    body: "Excluindo estágio: '{0}'."
                },
                finished: {
                    body: "Estágio excluído: '{0}'."
                }
            },
            extraction: {
                started: {
                    title: "Extração de Estágio",
                    body: "Extraindo estágio: '{0}'."
                },
                finished: {
                    body: "Estágio extraído: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Exclusão de Série",
                    body: "Excluindo todos os estágios da série: '{0}'."
                },
                finished: {
                    body: "Todos os estágios da série: '{0}' foram excluídos."
                }
            }
        },
        alt: {
            include: {
                started: {
                    title: "Inclusão de Alternativos",
                    body: "Garantindo que os alternativos sejam incluídos na lista de personagens."
                },
                finished: {
                    body: "Garantido que os alternativos sejam incluídos na lista de personagens."
                }
            },
            exclude: {
                started: {
                    title: "Exclusão de Alternativos",
                    body: "Garantindo que os alternativos sejam excluídos da lista de personagens."
                },
                finished: {
                    body: "Garantido que os alternativos sejam excluídos da lista de personagens."
                }
            },
            removal: {
                started: {
                    title: "Remoção de Alternativo",
                    body: "Removendo alternativo: '{0}' do personagem: '{1}'."
                },
                finished: {
                    body: "Alternativo removido: '{0}' do personagem: '{1}'."
                }
            },
            addition: {
                started: {
                    title: "Adição de Alternativo",
                    body: "Adicionando alternativo: '{0}' ao personagem: '{1}'."
                },
                finished: {
                    body: "Alternativo adicionado: '{0}' ao personagem: '{1}'."
                }
            }
        },
        css: {
            writeData: {
                started: {
                    title: "Salvar Dados CSS",
                    body: "Salvando dados CSS modificados na página: '{0}'."
                },
                finished: {
                    body: "Dados CSS modificados salvos na página: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Reordenar Páginas CSS",
                    body: "Movendo página CSS: '{0}' para a posição: {1}."
                },
                finished: {
                    body: "Página CSS: '{0}' movida para a posição: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "Adição de Página CSS",
                    body: "Adicionando nova página CSS: '{0}'."
                },
                finished: {
                    body: "Nova página CSS adicionada: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Renomear Página CSS",
                    body: "Renomeando página CSS: '{0}' para '{1}'."
                },
                finished: {
                    body: "Página CSS renomeada: '{0}' para '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "Exclusão de Página CSS",
                    body: "Excluindo página CSS: '{0}'."
                },
                finished: {
                    body: "Página CSS excluída: '{0}'."
                }
            }
        },
        sss: {
            writeData: {
                started: {
                    title: "Salvar Dados SSS",
                    body: "Salvando dados SSS modificados na página: '{0}'."
                },
                finished: {
                    body: "Dados SSS modificados salvos na página: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Reordenar Páginas SSS",
                    body: "Movendo página SSS: '{0}' para a posição: {1}."
                },
                finished: {
                    body: "Página SSS: '{0}' movida para a posição: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "Adição de Página SSS",
                    body: "Adicionando nova página SSS: '{0}'."
                },
                finished: {
                    body: "Nova página SSS adicionada: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Renomear Página SSS",
                    body: "Renomeando página SSS: '{0}' para '{1}'."
                },
                finished: {
                    body: "Página SSS renomeada: '{0}' para '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "Exclusão de Página SSS",
                    body: "Excluindo página SSS: '{0}'."
                },
                finished: {
                    body: "Página SSS excluída: '{0}'."
                }
            }
        }
    },
    dialog: {
        alert: {
            selfContainedDir: {
                title: "Alerta de Local do Jogo Inválido",
                body: "O diretório de jogo selecionado está contido dentro do próprio diretório do CMC Mod Manager. O CMC Mod Manager exclui todos os arquivos deste diretório ao atualizar, portanto ele não pode ser usado para armazenar seus arquivos de jogo. Por favor, mova-os para um local diferente"
            },
            invalidGameDir: {
                title: "Diretório Inválido Selecionado",
                body: "O diretório selecionado é inválido, pois não contém um dos executáveis de identificação."
            },
            postUpdate: {
                title: "Mensagem Pós-Atualização",
                body: "Obrigado por atualizar o CMC Mod Manager! O site do CMC Mod Manager também foi atualizado, então considere dar uma olhada: https://inferno214221.com/cmc-mod-manager/ (um link também está disponível na aba 'Início'). Também criei uma página 'Buy Me A Coffee' se você quiser apoiar o projeto!"
            },
            noDirSelected: {
                title: "Nenhum Diretório Selecionado",
                body: "Por favor, selecione seu diretório CMC+ antes de continuar."
            },
            languageUpdated: {
                title: "Idioma Atualizado",
                body: "Por favor, feche e reinicie o CMC Mod Manager para aplicar as alterações."
            },
            licenseNotice: {
                title: "Aviso de Licença",
            }
        },
        confirm: {
            programUpdate: {
                title: "Atualização do Programa",
                body: "O CMC Mod Manager precisa de uma atualização. Esta atualização será instalada automaticamente agora. Ela removerá todos os arquivos dentro do diretório do CMC Mod Manager. Se isso for um problema, cancele essa atualização e remova quaisquer arquivos afetados.",
                okLabel: "Continuar"
            },
            destructiveAction: {
                title: "Confirmação de Ação Destrutiva",
                body: "Esta ação é destrutiva e não pode ser desfeita. Tem certeza de que deseja continuar?",
                okLabel: "Continuar"
            },
            closeUnfinishedOperations: {
                title: "Operações Inacabadas",
                body: "Tem certeza de que deseja fechar o CMC Mod Manager? Algumas operações estão em andamento e serão canceladas se você fechar (ou recarregar) o programa.",
                okLabel: "Fechar Mesmo Assim"
            },
            beginCharacterInput: {
                title: "Instalação de Personagem",
                body: "O arquivo dat do personagem que está sendo instalado usa o formato vanilla e você precisará inserir algumas informações para a instalação. Essas informações geralmente podem ser encontradas em um arquivo txt no diretório principal do mod.",
                okLabel: "Continuar"
            },
            openCharacterDir: {
                title: "Instalação de Personagem",
                body: "Deseja abrir o diretório do mod para procurar arquivos txt manualmente?",
                okLabel: "Sim",
                cancelLabel: "Não"
            },
            beginStageInput: {
                title: "Instalação de Estágio",
                body: "Devido ao formato de modding atual do CMC+, você precisará inserir algumas informações sobre o estágio que está instalando. Essas informações geralmente podem ser encontradas em um arquivo txt no diretório principal do mod. (Se esse arquivo txt existir e contiver quatro linhas, a primeira provavelmente será desnecessária.)",
                okLabel: "Continuar"
            },
            openStageDir: {
                title: "Instalação de Estágio",
                body: "Deseja abrir o diretório do mod para procurar arquivos txt manualmente?",
                okLabel: "Sim",
                cancelLabel: "Não"
            }
        },
        prompt: {
            characterMenuName: {
                title: "Instalação de Personagem",
                body: "Por favor, insira o 'nome de menu' do personagem. (Este é o nome exibido quando o personagem é selecionado na tela de seleção de personagens.)",
                placeholder: "Nome de Menu do Personagem"
            },
            characterBattleName: {
                title: "Instalação de Personagem",
                body: "Por favor, insira o 'nome de batalha' do personagem. (Este é o nome exibido como parte do HUD durante uma partida.)",
                placeholder: "Nome de Batalha do Personagem",
            },
            characterSeries: {
                title: "Instalação de Personagem",
                body: "Por favor, insira a 'série' do personagem. (Este nome será usado para selecionar o ícone a ser usado na tela de seleção de personagens. Este valor é geralmente curto e em letras minúsculas.)",
                placeholder: "Série do Personagem",
            },
            stageMenuName: {
                title: "Instalação de Estágio",
                body: "Por favor, insira o 'nome de menu' do estágio. (O nome que será exibido na tela de seleção de estágios.)",
                placeholder: "Nome de Menu do Estágio"
            },
            stageSource: {
                title: "Instalação de Estágio",
                body: "Por favor, insira a 'origem' do estágio. (O nome do conteúdo de origem do qual o estágio é original, como o título do jogo.)",
                placeholder: "Origem do Estágio",
            },
            stageSeries: {
                title: "Instalação de Estágio",
                body: "Por favor, insira a 'série' do estágio. (Este nome será usado para selecionar o ícone a ser usado na tela de seleção de estágios. Este valor é geralmente curto e em letras minúsculas.)",
                placeholder: "Série do Estágio",
            }
        },
        defaults: {
            okLabel: "OK",
            cancelLabel: "Cancelar"
        },
        notification: {
            oneClickDownload: {
                title: "Download com 1 Clique iniciado",
                body: "Baixando mod com ID: '{0}' do GameBanana."
            }
        },
        installation: {
            character: {
                title: "Selecionar Personagens para Instalar"
            },
            stage: {
                title: "Selecionar Estágios para Instalar"
            }
        }
    },
    error: {
        noStringFound: "Não foi possível encontrar o texto para a chave: '{0}'.",
        invalidStringArgs: "Número inválido de argumentos ao substituir no texto.",
        missingDialogOptions: "Opções de diálogo não encontradas.",
        unsupportedArchiveType: "Tipo de arquivo não suportado: '{0}'.",
        unknownModType: "Tipo de mod desconhecido: '{0}'.",
        invalidSemverString: "Formato de versão inválido: '{0}'.",
        cantUpdateDevMode: "Não é possível atualizar no modo de desenvolvimento.",
        missingUpdateFiles: "Arquivos de atualização não encontrados.",
        streamError: "Ocorreu um erro na transferência: '{0}'.",
        noSingleInstanceLock: "Falha no bloqueio de instância única.",
        noRecursiveAlts: "Um personagem com alternativos não pode ser atribuído como um alternativo.",
        maxAltsReached: "O personagem já possui o número máximo de alternativos.",
        characterNotFound: "Personagem não encontrado: '{0}'.",
        stageNotFound: "Estágio não encontrado: '{0}'.",
        incompleteDat: "Dat do personagem está incompleto: '{0}'.",
        characterInstallTargetSelf: "Não é possível instalar personagens do diretório para o qual estão sendo instalados.",
        stageInstallTargetSelf: "Não é possível instalar estágios do diretório para o qual estão sendo instalados.",
        noValidCharactersFound: "Nenhum personagem válido encontrado no diretório: '{0}'.",
        noValidStagesFound: "Nenhum estágio válido encontrado no diretório: '{0}'.",
        noTopDir: "O caminho do arquivo não tem diretório: '{0}'.",
        noFighterSubdir: "Nenhum subdiretório 'fighter' encontrado no diretório: '{0}'.",
        noStageSubdir: "Nenhum subdiretório 'stage' encontrado no diretório: '{0}'.",
        noUpdateCharacter: "Personagem já instalado, atualizações desativadas.",
        noUpdateStage: "Estágio já instalado, atualizações desativadas.",
        noDatFile: "Personagem não tem arquivo dat.",
        customCssDisabled: "Páginas CSS personalizadas desativadas em game_settings.",
        operationCallNotFound: "Função de operação não encontrada: '{0}'."
    },
    tooltip: {
        character: {
            install: "Instalar Personagem",
            update: "Atualizar Personagem",
            search: "Pesquisar Personagens",
            installDir: "Instalar Personagem de um Diretório",
            installArch: "Instalar Personagem de um Arquivo",
            delete: "Excluir Personagem",
            extract: "Extrair Personagem",
            deleteSeries: "Excluir Todos os Personagens da Série",
            showing: {
                all: "Mostrando: Todos os Personagens",
                new: "Mostrando: Novos Personagens",
                excluded: "Mostrando: Personagens Excluídos"
            },
            existing: {
                update: "Personagens Existentes: Atualizar",
                abort: "Personagens Existentes: Abortar"
            }
        },
        stage: {
            install: "Instalar Estágio",
            update: "Atualizar Estágio",
            search: "Pesquisar Estágios",
            installDir: "Instalar Estágio de um Diretório",
            installArch: "Instalar Estágio de um Arquivo",
            delete: "Excluir Estágio",
            extract: "Extrair Estágio",
            deleteSeries: "Excluir Todos os Estágios da Série",
            showing: {
                all: "Mostrando: Todos os Estágios",
                new: "Mostrando: Novos Estágios",
                excluded: "Mostrando: Estágios Excluídos"
            },
            existing: {
                update: "Estágios Existentes: Atualizar",
                abort: "Estágios Existentes: Abortar"
            }
        },
        alt: {
            remove: "Remover Alternativo",
            addition: {
                toThis: "Adicionar Alternativo a Este Personagem",
                thisFor: "Adicionar Este Personagem como Alternativo",
                cancel: "Cancelar Adição de Alternativo"
            },
            asCharacters: {
                included: "Alternativos: Incluídos Como Personagens",
                excluded: "Alternativos: Excluídos Como Personagens"
            }
        },
        ss: {
            addPage: "Adicionar Página",
            deletePage: "Excluir Página",
            column: {
                add: "Adicionar Coluna",
                remove: "Remover Coluna"
            },
            row: {
                add: "Adicionar Linha",
                remove: "Remover Linha"
            }
        },
        sortBy: {
            number: "Ordenar Por: Número Interno",
            series: "Ordenar Por: Série",
            alphabetical: "Ordenar Por: Ordem Alfabética"
        },
        sortDirection: {
            backwards: "Direção da Ordenação: Inversa",
            forwards: "Direção da Ordenação: Normal"
        },
        dragMode: {
            auto: "Modo de Arrastar: Automático",
            insert: "Modo de Arrastar: Inserir",
            swap: "Modo de Arrastar: Trocar"
        },
        installation: {
            filter: "Instalação: Apenas Arquivos Necessários",
            all: "Instalação: Todos os Arquivos"
        },
        randomSelection: {
            enabled: "Seleção Aleatória: Ativada",
            disabled: "Seleção Aleatória: Desativada"
        },
        operationPanel: {
            show: "Mostrar Operações",
            hide: "Ocultar Operações"
        },
        operation: {
            cancel: "Cancelar Operação"
        },
        gameDir: {
            noneSelected: "(Nenhum Selecionado)",
            change: "Alterar Diretório CMC+",
            open: "Abrir Diretório CMC+",
            run: "Executar CMC+"
        },
        site: {
            homepage: "Início"
        },
        closeWindow: "Fechar Janela",
        openExtractionDir: "Abrir Diretório de Extração",
        openExtractedFiles: "Abrir Arquivos Extraídos"
    },
    ui: {
        tabs: {
            home: {
                title: "Início"
            },
            characters: {
                title: "Personagens",
                desc: "Instale, extraia ou exclua personagens do CMC+."
            },
            characterSelectionScreen: {
                title: "Tela de Seleção de Personagens",
                desc: "Modifique a tela de seleção de personagens do CMC+."
            },
            stages: {
                title: "Estágios",
                desc: "Instale, extraia ou exclua estágios do CMC+."
            },
            stageSelectionScreen: {
                title: "Tela de Seleção de Estágios",
                desc: "Modifique a tela de seleção de estágios do CMC+."
            }
        },
        currentGameDir: "Diretório CMC+ Atual: ",
        searchPlaceholder: "Pesquisar",
        pagePlaceholder: "Nome da Página",
        showLicense: "Mostrar Licença (GNU GPLv3)",
        errorDisplay: "Um erro sendo exibido aqui significa que ele não está associado a uma operação e está impedindo a aba de ser renderizada.",
        operations: "Operações"
    },
    enumDisplayName: {
        character: "Personagem",
        stage: "Estágio"
    },
    other: {
        dat: {
            homeStages: "---Estágios (Modo Clássico)---",
            randomData: "---Outras Informações---",
            paletteNumber: "---Quantidade de Paletas---",
            paletteData: "---Dados das Paletas---",
            formatUpdated: "Atualizado para o formato dat do CMC+ v8 pelo CMC Mod Manager.",
        },
        selector: {
            archives: "Arquivos",
            all: "Todos os Arquivos",
        },
        autoUpdateFailed: "Devido à forma como o CMC Mod Manager foi instalado, ele não pode ser atualizado automaticamente. Por favor, baixe a versão mais recente do GitHub ou GameBanana. (Consulte a aba Início para os links.)",
        defaultPageName: "Padrão",
        languageName: "Português Brasil (Portuguese Brazil)",
        by: "por"
    }
};