/* eslint-disable @stylistic/js/max-len */
export default {
    operation: {
        update: {
            download: {
                started: {
                    title: "Baixar atualização",
                    body: "Baixando a versão mais recente do CMC Mod Manager.",
                },
                finished: {
                    title: "Atualização baixada",
                    body: "Versão mais recente do CMC Mod Manager baixada."
                }
            },
            install: {
                started: {
                    title: "Instalar Atualização",
                    body: "Instalando a versão mais recente do CMC Mod Manager."
                },
                finished: {
                    body: "Feche o CMC Mod Manager para concluir a atualização."
                }
            }
        },
        mod: {
            download: {
                started: {
                    title: "Baixar o Mod",
                    body: "Baixando um mod do GameBanana."
                },
                progress: {
                    0: {
                        title: "{0} A Baixar",
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
                    title: "Instalação de Personagem em Lote",
                    body: "Selecionando personagens para instalar em '{0}'."
                },
                finished: {
                    body: "Personagens selecionados para instalação em '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Instalação de Personagens",
                    body: "Instalando um personagem de {0}."
                },
                finished: {
                    body: "Personagem instalado: '{0}' de {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Seleção de Personagens",
                    body: "Alternar a habilidade do personagem: '{0}' para ser selecionado aleatoriamente."
                },
                finished: {
                    body: "Habilidade do personagem alternada: '{0}' para ser selecionado aleatoriamente."
                }
            },
            deletion: {
                started: {
                    title: "Excluir Personagem",
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
                    body: "Personagem extraido: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Excluir em Série",
                    body: "Excluindo todos os personagens da série: '{0}'."
                },
                finished: {
                    body: "Excluido todos os personagens da série: '{0}'."
                }
            }
        },
        stage: {
            bulkInstallation: {
                started: {
                    title: "Instalação do Palco em Lote",
                    body: "Selecionando os palcos para instalar do '{0}'."
                },
                finished: {
                    body: "Palcos selecionados para a instalação do '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Instalação de Palco",
                    body: "Instalando um palco de {0}."
                },
                finished: {
                    body: "Palco instalado: '{0}' de {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Seleção de Palco",
                    body: "Alternar a habilidade do palco: '{0}' para ser selecionado aleatoriamente."
                },
                finished: {
                    body: "Habilidade do palco alternada: '{0}' para ser selecionado aleatoriamente."
                }
            },
            deletion: {
                started: {
                    title: "Excluir Palco",
                    body: "Excluindo palco: '{0}'."
                },
                finished: {
                    body: "Palco excluído: '{0}'."
                }
            },
            extraction: {
                started: {
                    title: "Extração de Palco",
                    body: "Extraindo palco: '{0}'."
                },
                finished: {
                    body: "Palco extraído: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Excluir em Série",
                    body: "Excluindo todos os palcos da série: '{0}'."
                },
                finished: {
                    body: "Excluído todos os palcos da série: '{0}'."
                }
            }
        },
        alt: {
            include: {
                started: {
                    title: "Inclusão dos Alternativos",
                    body: "Garante que os personagens alternativos estejam incluídos na lista de personagens."
                },
                finished: {
                    body: "Garantiu que os personagens alternativos foram incluídos na lista de personagens."
                }
            },
            exclude: {
                started: {
                    title: "Exclusão dos Alternativos",
                    body: "Garante que os personagens alternativos sejam excluídos da lista de personagens."
                },
                finished: {
                    body: "Garantiu que os personagens alternativos fossem excluídos da lista de personagens."
                }
            },
            removal: {
                started: {
                    title: "Remoção dos Alternativos",
                    body: "Removendo personagem alternativo: '{0}' do personagem: '{1}'."
                },
                finished: {
                    body: "Removido o personagem alternativo: '{0}' do personagem: '{1}'."
                }
            },
            addition: {
                started: {
                    title: "Adicionar um Alternativo",
                    body: "Adicionando um personagem alternativo: '{0}' para o personagem: '{1}'."
                },
                finished: {
                    body: "Adicionado personagem alternativo: '{0}' para o personagem: '{1}'."
                }
            }
        },
        css: {
            writeData: {
                started: {
                    title: "Escrever Dados CSS",
                    body: "Gravando dados CSS modificados na página: '{0}'."
                },
                finished: {
                    body: "Dados CSS modificados gravados na página: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Organizar Páginas CSS",
                    body: "Movendo página CSS: '{0}' para o índice: {1}."
                },
                finished: {
                    body: "Página CSS movida: '{0}' para o índice: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "Adição de Página CSS",
                    body: "Adicionando nova página CSS: '{0}'."
                },
                finished: {
                    body: "Adicionada nova página CSS: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Renomear Página CSS",
                    body: "Renomeando página CSS: '{0}' para '{1}'."
                },
                finished: {
                    body: "Ronomeada a página CSS: '{0}' para '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "Exclusão de Página CSS",
                    body: "Deletando a página CSS: '{0}'."
                },
                finished: {
                    body: "Deletada a página CSS: '{0}'."
                }
            }
        },
        sss: {
            writeData: {
                started: {
                    title: "Escrever dados SSS",
                    body: "Gravando dados SSS modificados na página: '{0}'."
                },
                finished: {
                    body: "Dados SSS modificados gravados na página: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Organizar Páginas SSS",
                    body: "Movendo página SSS: '{0}' para o índice: {1}."
                },
                finished: {
                    body: "Página SSS movida: '{0}' para o índice: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "Adição de Página SSS",
                    body: "Adicionando nova página SSS: '{0}'."
                },
                finished: {
                    body: "Adicionada nova página SSS: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Renomear Página SSS",
                    body: "Renomeando página SSS: '{0}' to '{1}'."
                },
                finished: {
                    body: "Ronomeada a página SSS: '{0}' to '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "Exclusão da Página SSS",
                    body: "Deletando a página SSS: '{0}'."
                },
                finished: {
                    body: "Deletada a página SSS: '{0}'."
                }
            }
        }
    },
    dialog: {
        alert: {
            selfContainedDir: {
                title: "Aviso de Localização de Jogo Inválida",
                body: "O diretório de jogo selecionado está dentro da pasta do CMC Mod Manager. O CMC Mod Manager exclui TODOS os arquivos desta pasta durante atualizações, portanto NÃO pode ser usado para armazenar seus arquivos de jogo. Por favor, mova-os para outro local."
            },
            invalidGameDir: {
                title: "Diretório Selecionado Inválido",
                body: "O diretório selecionado é inválido porque não contém um dos arquivos executáveis de identificação."
            },
            postUpdate: {
                title: "Mensagem Pós-Atualização",
                body: "Obrigado por atualizar o CMC Mod Manager! O site do CMC Mod Manager também foi atualizado, então considere visitá-lo: https://inferno214221.com/cmc-mod-manager/ (um link também está disponível na aba 'Home'). Também criei uma página no 'Buy Me A Coffee' caso queira apoiar o projeto!"
            },
            noDirSelected: {
                title: "Nenhum Diretório Selecionado",
                body: "Selecione seu diretório CMC+ antes de continuar."
            },
            languageUpdated: {
                title: "Idioma Atualizado",
                body: "Feche e Reinicie o CMC Mod Manager para aplicar as alterações."
            },
            licenseNotice: {
                title: "Aviso de Licença",
            }
        },
        confirm: {
            programUpdate: {
                title: "Atualização do Programa",
                body: "CMC Mod Manager requer uma atualização. Esta atualização será instalada automaticamente. Atenção: esta atualização removerá todos os arquivos do diretório do CMC Mod Manager. Se isso for problemático, cancele a atualização e remova manualmente os arquivos afetados.",
                okLabel: "Continuar"
            },
            destructiveAction: {
                title: "Confirmação de Ação Destrutiva",
                body: "Esta ação é destrutiva e não pode ser desfeita. Tem certeza de que deseja continuar?",
                okLabel: "Continuar"
            },
            closeUnfinishedOperations: {
                title: "Operações Incompletas",
                body: "Tem certeza de que deseja fechar o CMC Mod Manager? Algumas operações ainda estão em andamento e serão canceladas se você fechar (ou recarregar) o programa.",
                okLabel: "Fechar Mesmo Assim"
            },
            beginCharacterInput: {
                title: "Instalação do Personagem",
                body: "O arquivo .dat do personagem que está sendo instalado utiliza o formato vanilla, e será necessário fornecer algumas informações para a instalação. Essas informações geralmente podem ser encontradas em um arquivo .txt no diretório principal do mod.",
                okLabel: "Continue"
            },
            openCharacterDir: {
                title: "Instalação do Personagem",
                body: "Deseja abrir o diretório do mod para procurar arquivos .txt manualmente?",
                okLabel: "Sim",
                cancelLabel: "Não"
            },
            beginStageInput: {
                title: "Istalação do Palco",
                body: "Devido ao formato atual de modding do CMC+, será necessário inserir algumas informações sobre o palco que você está instalando. Essas informações geralmente podem ser encontradas em um arquivo .txt no diretório principal do mod. (Se esse arquivo .txt existir e contiver quatro linhas, a primeira provavelmente é desnecessária.)",
                okLabel: "Continuar"
            },
            openStageDir: {
                title: "Instalação do Palco",
                body: "Deseja abrir o diretório do mod para procurar arquivos .txt manualmente?",
                okLabel: "Sim",
                cancelLabel: "Não"
            }
        },
        prompt: {
            characterMenuName: {
                title: "Instalação do Personagem",
                body: "Por favor, insira o 'nome no menu' do personagem. (Este é o nome exibido quando o personagem é selecionado na tela de seleção de personagens.)",
                placeholder: "Nome do Personagem no Menu"
            },
            characterBattleName: {
                title: "Instalação do Personagem",
                body: "Por favor, insira o 'nome em batalha' do personagem. (Este é o nome exibido como parte da HUD durante uma partida.)",
                placeholder: "Nome do Personagem em Batalha",
            },
            characterSeries: {
                title: "Instalação do Personagem",
                body: "Por favor, insira a 'série' do personagem. (Este nome será usado para selecionar o ícone na tela de seleção de personagens. Normalmente é um valor curto em letras minúsculas.)",
                placeholder: "Série do Personagem",
            },
            stageMenuName: {
                title: "Instalação do Palco",
                body: "Por favor, insira o 'nome no menu' do palco. (O nome que será exibido na tela de seleção de palcos.)",
                placeholder: "Nome do Palco no Menu"
            },
            stageSource: {
                title: "Instalação do Palco",
                body: "Por favor, insira a 'fonte' do palco. (O nome do conteúdo de origem do qual o palco provém, como o título do jogo.)",
                placeholder: "Fonte do Palco",
            },
            stageSeries: {
                title: "Instalação do Palco",
                body: "Por favor, insira a 'série' do palco. (Este nome será usado para selecionar o ícone na tela de seleção de palcos. Normalmente é um valor curto em letras minúsculas.)",
                placeholder: "Série do Palco",
            }
        },
        defaults: {
            okLabel: "OK",
            cancelLabel: "Cancelar"
        },
        notification: {
            oneClickDownload: {
                title: "Download em 1 Clique iniciado",
                body: "Baixando mod com ID: '{0}' do GameBanana."
            }
        },
        installation: {
            character: {
                title: "Selecione os Personagens Para Instalar"
            },
            stage: {
                title: "Selecione os Palcos Para Instalar"
            }
        }
    },
    error: {
        noStringFound: "Não foi possível obter a string para a chave: '{0}'.",
        invalidStringArgs: "Número inválido de argumentos ao substituir na string.",
        missingDialogOptions: "Opções de diálogo não encontradas.",
        unsupportedArchiveType: "Tipo de arquivo não suportado: '{0}'.",
        unknownModType: "Tipo de mod desconhecido: '{0}'.",
        invalidSemverString: "String semver inválida: '{0}'.",
        cantUpdateDevMode: "Não é possível atualizar em modo de desenvolvimento.",
        missingUpdateFiles: "Arquivos de atualização não encontrados.",
        streamError: "Ocorreu um erro de stream: '{0}'.",
        noSingleInstanceLock: "Falha no bloqueio de instância única.",
        noRecursiveAlts: "Um personagem com alternativos não pode ser atribuído como alternativa.",
        maxAltsReached: "Personagem já possui o número máximo de alternativas.",
        characterNotFound: "Personagem não encontrado: '{0}'.",
        stageNotFound: "Palco não encontrado: '{0}'.",
        incompleteDat: "Arquivo dat do personagem está incompleto: '{0}'.",
        characterInstallTargetSelf: "Não é possível instalar personagens no mesmo diretório de origem.",
        stageInstallTargetSelf: "Não é possível instalar palcos no mesmo diretório de origem.",
        noValidCharactersFound: "Nenhum personagem válido encontrado no diretório: '{0}'.",
        noValidStagesFound: "Nenhum palco válido encontrado no diretório: '{0}'.",
        noTopDir: "O caminho do arquivo não possui diretório: '{0}'.",
        noFighterSubdir: "Nenhum subdiretório 'fighter' encontrado em: '{0}'.",
        noStageSubdir: "Nenhum subdiretório 'stage' encontrado em: '{0}'.",
        noUpdateCharacter: "Personagem já instalado, atualizações desativadas.",
        noUpdateStage: "Palco já instalado, atualizações desativadas.",
        noDatFile: "Personagem não possui arquivo dat.",
        customCssDisabled: "Páginas CSS personalizadas desativadas no game_settings.",
        operationCallNotFound: "Função de operação não encontrada: '{0}'."
    },
    tooltip: {
        character: {
            install: "Instalar Personagem",
            update: "Atualizar Personagem",
            search: "Pesquisar Personagem",
            installDir: "Instalar Personagem do Diretório",
            installArch: "Instalar Personagem do Arquivo",
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
            install: "Instalar Palco",
            update: "Atualizar Palco",
            search: "Pesquisar Palco",
            installDir: "Instalar Palco do Diretório",
            installArch: "Instalar Palco do Arquivo",
            delete: "Excluir Palco",
            extract: "Extrair Palco",
            deleteSeries: "Excluir Todos os Palcos da Série",
            showing: {
                all: "Mostrando: Todos os Palcos",
                new: "Mostrando: Novos Palcos",
                excluded: "Mostrando: Palcos Excluídos"
            },
            existing: {
                update: "Palcos Existentes: Atualizar",
                abort: "Palcos Existentes: Abortar"
            }
        },
        alt: {
            remove: "Remover os Alternativos",
            addition: {
                toThis: "Adicionar Personagem Alternativo a Este Personagem",
                thisFor: "Adicionar como Personagem Alternativo ao Personagem Selecionado",
                cancel: "Cancelar a Adição de Personagem Alternativo"
            },
            asCharacters: {
                included: "Alternativas: Incluídas como Personagens",
                excluded: "Alternativas: Excluídas dos Personagens"
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
            number: "Classificar Por: Número Interno",
            series: "Classificar Por: Série",
            alphabetical: "Classificar Por: Ordem Alfabética"
        },
        sortDirection: {
            backwards: "Direção de Ordenação: Para Trás",
            forwards: "Direção de Ordenação: Para Frente"
        },
        installation: {
            filter: "Instalação: Apenas Arquivos Necessários",
            all: "Instalação: Todos os Arquivos"
        },
        randomSelection: {
            enabled: "Seleção Aleatória: Ativado",
            disabled: "Seleção Aleatória: Desativado"
        },
        operationPanel: {
            show: "Mostrar Operações",
            hide: "Ocultar Operações"
        },
        operation: {
            cancel: "Cancelar Operação"
        },
        gameDir: {
            noneSelected: "(Selecionado Nenhum)",
            change: "Alterar Diretório do CMC+",
            open: "Abrir Diretório do CMC+",
            run: "Executar CMC+"
        },
        site: {
            homepage: "Página Inicial"
        },
        closeWindow: "Fechar Janela",
        openExtractionDir: "Abrir Diretório Extração",
        openExtractedFiles: "Abrir Arquivos Extraídos"
    },
    ui: {
        tabs: {
            home: {
                title: "Ínicio"
            },
            characters: {
                title: "Personagens",
                desc: "Instalar, extrair ou remover personagens do CMC+."
            },
            characterSelectionScreen: {
                title: "Seleção de Personagens",
                desc: "Modificar a tela de seleção de personagens do CMC+."
            },
            stages: {
                title: "Palcos",
                desc: "Instalar, extrair ou remover palcos do CMC+."
            },
            stageSelectionScreen: {
                title: "Seleção de Palcos",
                desc: "Modificar a tela de seleção de palcos do CMC+."
            }
        },
        currentGameDir: "Diretório CMC+ atual: ",
        searchPlaceholder: "Pesquisar",
        pagePlaceholder: "Nome da Página",
        showLicense: "Liçença de Exibição (GNU GPLv3)",
        errorDisplay: "Um erro exibido aqui indica que ele não está associado a uma operação e está impedindo a renderização da aba.",
        operations: "Operações"
    },
    enumDisplayName: {
        character: "Personagem",
        stage: "Palco"
    },
    other: {
        dat: {
            homeStages: "---Casa de Palcos (Modo Classic)---",
            randomData: "---Dados Adicionais---",
            paletteNumber: "---Quantas Paletas de Cores---",
            paletteData: "---Dados de Paletas---",
            formatUpdated: "Atualizado para o formato dat do CMC+ v8 pelo CMC Mod Manager.",
        },
        selector: {
            archives: "Arquivos",
            all: "Todos os Arquivos"
        },
        autoUpdateFailed: "Devido à forma como o CMC Mod Manager foi instalado, a atualização automática não está disponível. Por favor, baixe a versão mais recente manualmente no GitHub ou GameBanana. (Consulte a aba 'Início' para os links.)",
        defaultPageName: "Padrão",
        languageName: "Português Brasil (Portuguese Brazil)"
    }
};