/* eslint-disable @stylistic/js/max-len */
export default {
    operation: {
        update: {
            download: {
                started: {
                    title: "下载更新",
                    body: "正在下载最新版本的CMC Mod Manager。",
                },
                finished: {
                    title: "更新下载完毕",
                    body: "最新版本的CMC Mod Manager已下载完毕。"
                }
            },
            install: {
                started: {
                    title: "安装更新",
                    body: "正在安装最新版本的CMC Mod Manager。"
                },
                finished: {
                    body: "请关闭CMC Mod Manager以完成更新。"
                }
            }
        },
        mod: {
            download: {
                started: {
                    title: "mod下载",
                    body: "下载一个来自GameBanana的mod。"
                },
                progress: {
                    0: {
                        title: "{0} 下载",
                        body: "正在下载来自Gamebanana的：'{0}' mod。",
                    },
                    1: {
                        body: "正在提取下载的mod。",
                    },
                },
                finished: {
                    body: "已完成下载来自Gamebanana的：'{0}' mod。"
                }
            }
        },
        character: {
            bulkInstallation: {
                started: {
                    title: "批量人物安装",
                    body: "请从'{0}'中选择要安装的人物。"
                },
                finished: {
                    body: "已选择从'{0}'中要安装的人物。"
                }
            },
            installation: {
                started: {
                    title: "人物安装",
                    body: "正在安装来自{0}的人物。"
                },
                finished: {
                    body: "已成功安装人物：{1}里面的'{0}'。"
                }
            },
            randomSelection: {
                started: {
                    title: "人物选择",
                    body: "正在调整：'{0}'的是否被随机选择性。"
                },
                finished: {
                    body: "已调整：'{0}'的是否被随机选择性。"
                }
            },
            deletion: {
                started: {
                    title: "删除人物",
                    body: "删除人物中：'{0}'。"
                },
                finished: {
                    body: "删除人物：'{0}'。"
                }
            },
            extraction: {
                started: {
                    title: "提取人物",
                    body: "提取人物中：'{0}'。"
                },
                finished: {
                    body: "已提取人物：'{0}'。"
                }
            },
            seriesDeletion: {
                started: {
                    title: "系列删除",
                    body: "正在删除所有来自同一系列的人物：'{0}'。"
                },
                finished: {
                    body: "已删除所有来自同一系列的人物：'{0}'。"
                }
            }
        },
        stage: {
            bulkInstallation: {
                started: {
                    title: "批量场地安装",
                    body: "请从'{0}'中选择要安装的场地。"
                },
                finished: {
                    body: "已选择从'{0}'中要安装的场地。"
                }
            },
            installation: {
                started: {
                    title: "场地安装",
                    body: "正在安装来自{0}的场地。"
                },
                finished: {
                    body: "已成功安装场地：{1}里面的'{0}'。"
                }
            },
            randomSelection: {
                started: {
                    title: "场地选择",
                    body: "正在调整：'{0}'的是否被随机选择性。"
                },
                finished: {
                    body: "已调整：'{0}'的是否被随机选择性。"
                }
            },
            deletion: {
                started: {
                    title: "场地删除",
                    body: "正在删除场地：'{0}'。"
                },
                finished: {
                    body: "已删除场地：'{0}'。"
                }
            },
            extraction: {
                started: {
                    title: "提取场地",
                    body: "提取场地中：'{0}'。"
                },
                finished: {
                    body: "已提取场地：'{0}'。"
                }
            },
            seriesDeletion: {
                started: {
                    title: "系列删除",
                    body: "正在删除所有来自同一系列的场地：'{0}'。"
                },
                finished: {
                    body: "已删除所有来自同一系列的场地：'{0}'。"
                }
            }
        },
        alt: {
            include: {
                started: {
                    title: "替换版本包含",
                    body: "正在确认该替换版本已在人物列表中。"
                },
                finished: {
                    body: "已确认该替换版本已在人物列表里。"
                }
            },
            exclude: {
                started: {
                    title: "替换版本移除",
                    body: "正在确认该替换版本已在人物列表被移除出去。"
                },
                finished: {
                    body: "已确认该替换版本已在人物列表被移除出去。"
                }
            },
            removal: {
                started: {
                    title: "替换版本卸载",
                    body: "正在从该人物：'{1}'中卸载替换版本：'{0}'中。"
                },
                finished: {
                    body: "已从该人物：'{1}'中卸载替换版本：'{0}'。"
                }
            },
            addition: {
                started: {
                    title: "替换版本增加",
                    body: "正在从该人物：'{1}'中增加替换版本：'{0}'中。"
                },
                finished: {
                    body: "已从该人物：'{1}'中增加替换版本：'{0}'。"
                }
            }
        },
        css: {
            writeData: {
                started: {
                    title: "编写CSS文件",
                    body: "正在将已修改的CSS文件数据写入该页面中：'{0}'。"
                },
                finished: {
                    body: "已将已修改的CSS文件数据写入该页面：'{0}'。"
                }
            },
            reorderPages: {
                started: {
                    title: "重新排序CSS页面",
                    body: "正在将CSS页面'{0}'移动到索引：{1}中。"
                },
                finished: {
                    body: "已将CSS页面'{0}'移动到索引：{1}。"
                }
            },
            pageAddition: {
                started: {
                    title: "新增CSS页面",
                    body: "正在增加新的CSS页面：'{0}'。"
                },
                finished: {
                    body: "已增加新的CSS页面：'{0}'。"
                }
            },
            renamePage: {
                started: {
                    title: "重命名CSS页面",
                    body: "正在将该CSS页面的名字：'{0}'重命名为'{1}'。"
                },
                finished: {
                    body: "已将该CSS页面的名字：'{0}'重命名为'{1}'。"
                }
            },
            pageDeletion: {
                started: {
                    title: "CSS页面删除",
                    body: "正在删除CSS页面：'{0}'。"
                },
                finished: {
                    body: "已删除CSS页面：'{0}'。"
                }
            }
        },
        sss: {
            writeData: {
                started: {
                    title: "编写SSS文件",
                    body: "正在将已修改的SSS文件数据写入该页面中：'{0}'。"
                },
                finished: {
                    body: "已将已修改的SSS文件数据写入该页面：'{0}'。"
                }
            },
            reorderPages: {
                started: {
                    title: "重新排序SSS页面",
                    body: "正在将SSS页面'{0}'移动到索引：{1}中。"
                },
                finished: {
                    body: "已将SSS页面'{0}'移动到索引：{1}。"
                }
            },
            pageAddition: {
                started: {
                    title: "新增CSS页面",
                    body: "正在增加新的CSS页面：'{0}'。"
                },
                finished: {
                    body: "已增加新的CSS页面：'{0}'。"
                }
            },
            renamePage: {
                started: {
                    title: "重命名CSS页面",
                    body: "正在将该CSS页面的名字：'{0}'重命名为'{1}'。"
                },
                finished: {
                    body: "已将该CSS页面的名字：'{0}'重命名为'{1}'。"
                }
            },
            pageDeletion: {
                started: {
                    title: "CSS页面删除",
                    body: "正在删除CSS页面：'{0}'。"
                },
                finished: {
                    body: "已删除CSS页面：'{0}'。"
                }
            }
        }
    },
    dialog: {
        alert: {
            selfContainedDir: {
                title: "无效游戏位置警告",
                body: "所选的游戏目录包含CMC Mod Manager自身目录。鉴于CMC Mod Manager在更新中会删除所在目录中的所有文件，因此该目录无法用于存储其游戏文件，请将游戏文件移到别的位置。"
            },
            invalidGameDir: {
                title: "所选目录无效",
                body: "因不包含可识别的可执行文件之一，所选目录无效。"
            },
            postUpdate: {
                title: "更新消息发布",
                body: "感谢更新CMC Mod Manager！其CMC Mod Manager网站也已更新，所以请务必过来看看：https://inferno214221.com/cmc-mod-manager/ (在'Home'选项卡中也有公开链接)。 如果你愿意支持该项目，可以在'Buy Me A Coffee'的页面中进行支持！"
            },
            noDirSelected: {
                title: "未选择目录",
                body: "请选择你的CMC+所在的目录，然后再继续操作。"
            },
            languageUpdated: {
                title: "语言更新",
                body: "请关闭并重新启动CMC Mod Manager以应用更新。译者为kirbyTV！"
            },
            licenseNotice: {
                title: "许可通知",
            }
        },
        confirm: {
            programUpdate: {
                title: "程序更新",
                body: "CMC Mod Manager现需更新。此更新现将自动安装，并将删除CMC Mod Manager所在目录中的所有文件，如果有任何问题，请取消此更新并删除任何会受其影响的文件。",
                okLabel: "确定"
            },
            destructiveAction: {
                title: "风险行动确认",
                body: "此操作具有一定的风险性，且之后无法撤销。你确定你要继续该操作？",
                okLabel: "确定"
            },
            closeUnfinishedOperations: {
                title: "未完成的操作",
                body: "你确定要关CMC Mod Manager？还有操作尚未完成，如果程序被关（或者重新加载）将取消这些操作。",
                okLabel: "总之关了吧"
            },
            beginCharacterInput: {
                title: "人物安装",
                body: "正在安装的人物的dat文件的格式为原版的格式，需在dat文件里输入一些安装信息。这些信息通常在mod顶层目录的txt文件中有放出示例。",
                okLabel: "确定"
            },
            openCharacterDir: {
                title: "人物安装",
                body: "要为了查找任何txt文件然后自己打开Mod的目录吗？",
                okLabel: "是",
                cancelLabel: "否"
            },
            beginStageInput: {
                title: "场地安装",
                body: "因是CMC的地图移植，请自己输入一些关于你正在安装的地图的信息。这些信息通常在mod顶层目录的txt文件中有放出示例。（如果这txt文件存在并且里面还写了4行，那么通常情况下第一行可以直接忽略。）",
                okLabel: "确定"
            },
            openStageDir: {
                title: "场地安装",
                body: "要为了查找任何txt文件然后自己打开Mod的目录吗？",
                okLabel: "是",
                cancelLabel: "否"
            }
        },
        prompt: {
            characterMenuName: {
                title: "人物安装",
                body: "请输入人物的'菜单名字'（用于在选人界面中该人物被选中时会显示的名字）",
                placeholder: "该人物的菜单名字"
            },
            characterBattleName: {
                title: "人物安装",
                body: "请输入人物的'对战名字'（用于在对局中因头像框附近没有使用名字贴图而直接显示的名字）",
                placeholder: "该人物的对战名字",
            },
            characterSeries: {
                title: "人物安装",
                body: "请输入人物的'系列名'（用于在选人界面中人物被选中时所在背景屏幕中显示的图标。其所需字符通常少且省）",
                placeholder: "该人物的系列名",
            },
            stageMenuName: {
                title: "场地安装",
                body: "请输入场地的'菜单名字'（用于在场地选择界面中该场地被选中时会显示的名字）",
                placeholder: "该场地的菜单名字"
            },
            stageSource: {
                title: "场地安装",
                body: "请输入场地的'出场作品'（用于场地的'菜单名字'底下，通常是指该场景原本出自哪部作品）",
                placeholder: "该场地的出场作品",
            },
            stageSeries: {
                title: "场地安装",
                body: "请输入场地的'系列名'（用于在场地选择界面中场地被选中时所在预览右上角中显示的图标。其所需字符通常少且省）",
                placeholder: "该场地的系列名",
            }
        },
        defaults: {
            okLabel: "好勒",
            cancelLabel: "取消"
        },
        notification: {
            oneClickDownload: {
                title: "一键安装已初始化",
                body: "正在下载从GameBanana中的ID为'{0}'的mod。"
            }
        },
        installation: {
            character: {
                title: "选择要安装的人物"
            },
            stage: {
                title: "选择要安装的场地"
            }
        }
    },
    error: {
        noStringFound: "无法获取密钥的字符串：'{0}'。",
        invalidStringArgs: "代入字符串时参数个数无效。",
        missingDialogOptions: "对话框选项被吃了说是。",
        unsupportedArchiveType: "不支持的Archive类型：'{0}'。",
        unknownModType: "不支持的mod类型：'{0}'。",
        invalidSemverString: "无效的Semver字符串：'{0}'。",
        cantUpdateDevMode: "谁教你在开发模式里试图更新东西的",
        missingUpdateFiles: "更新文件丢哪了你知道吗",
        streamError: "传输错误：'{0}'。",
        noSingleInstanceLock: "单示例锁定失败。",
        noRecursiveAlts: "有替换版本的人物是无法当上别的人物替换版本的。",
        maxAltsReached: "该人物的替换版本可容数量已达上限，另找别家吧。",
        characterNotFound: "该人物失踪了：'{0}'。",
        stageNotFound: "该场地被拆了：'{0}'。",
        incompleteDat: "人物的dat并非完整：'{0}'。",
        characterInstallTargetSelf: "没法在同一个已经安装人物的地方安装人物谢谢。",
        stageInstallTargetSelf: "没法在同一个已经安装场地的地方安装场地谢谢。",
        noValidCharactersFound: "你这目录怎么没一个真人（全是无效人物）：'{0}'。",
        noValidStagesFound: "你这目录怎么没一个非纸做的场地（全是无效场地）：'{0}'。",
        noTopDir: "你这文件路径甚至不带目录是吧：'{0}'。",
        noFighterSubdir: "从你这目录里找不到任何一个名叫'fighter'的子目录：'{0}'。",
        noStageSubdir: "从你这目录里找不到任何一个名叫'stage'的子目录：'{0}'。",
        noUpdateCharacter: "人物已被安装，更新无效。",
        noUpdateStage: "场地已被安装，更新无效。",
        noDatFile: "这 角 色 没 dat 文 件 。",
        customCssDisabled: "自定义CSS页面已经在game_settings里被关了。",
        operationCallNotFound: "找不到操作函数：'{0}'。"
    },
    tooltip: {
        character: {
            install: "安装人物",
            update: "更新人物",
            search: "搜索人物",
            installDir: "从目录中安装人物",
            installArch: "从Archive中安装人物",
            delete: "删除人物",
            extract: "提取人物",
            deleteSeries: "删除所有该系列的人物",
            showing: {
                all: "仅展示：所有人物",
                new: "仅展示：新人物",
                excluded: "仅展示：被排除人物"
            },
            existing: {
                update: "现有人物：更新",
                abort: "现有人物：中止"
            }
        },
        stage: {
            install: "安装场地",
            update: "更新场地",
            search: "搜索场地",
            installDir: "从目录中安装场地",
            installArch: "从Archive中安装场地",
            delete: "删除场地",
            extract: "提取场地",
            deleteSeries: "删除所有该系列的场地",
            showing: {
                all: "仅展示：所有场地",
                new: "仅展示：新场地",
                excluded: "仅展示：被排除场地"
            },
            existing: {
                update: "现有场地：更新",
                abort: "现有场地：中止"
            }
        },
        alt: {
            remove: "移除替换版本",
            addition: {
                toThis: "给该人物增加替换版本",
                thisFor: "选中人物作为替换版本",
                cancel: "取消新增替换版本"
            },
            asCharacters: {
                included: "替换版本：与人物包含",
                excluded: "替换版本：排除在人物之外"
            }
        },
        ss: {
            addPage: "增加页数",
            deletePage: "删除页数",
            column: {
                add: "加一列",
                remove: "减一列"
            },
            row: {
                add: "加一行",
                remove: "减一行"
            }
        },
        sortBy: {
            number: "排序依据：内部注册号数",
            series: "排序依据：系列名",
            alphabetical: "排序依据：字母排序"
        },
        sortDirection: {
            backwards: "排序方向：后",
            forwards: "排序方向：前"
        },
        installation: {
            filter: "安装：只需要必要的",
            all: "安装：全都要"
        },
        randomSelection: {
            enabled: "可被随机选择：启用",
            disabled: "可被随机选择：禁用"
        },
        operationPanel: {
            show: "显示操作",
            hide: "隐藏操作"
        },
        operation: {
            cancel: "取消操作"
        },
        gameDir: {
            noneSelected: "（啥都没选中）",
            change: "更改CMC+目录",
            open: "打开CMC+目录",
            run: "启动CMC+"
        },
        site: {
            homepage: "主页"
        },
        closeWindow: "关闭窗口",
        openExtractionDir: "打开提取目录",
        openExtractedFiles: "打开提取的文件"
    },
    ui: {
        tabs: {
            home: {
                title: "主页"
            },
            characters: {
                title: "人物",
                desc: "安装，提取或删除CMC+的人物。"
            },
            characterSelectionScreen: {
                title: "选择人物界面",
                desc: "编辑CMC+的选人界面。"
            },
            stages: {
                title: "场地",
                desc: "安装，提取或删除CMC+的场地。"
            },
            stageSelectionScreen: {
                title: "选择场地界面",
                desc: "编辑CMC+的选择场地界面。"
            }
        },
        currentGameDir: "目前的CMC+目录：",
        searchPlaceholder: "搜索",
        pagePlaceholder: "页面名字",
        showLicense: "显示证书（GNU GPLv3）",
        errorDisplay: "此处出现错误可能并非是你干的而且它阻止了选项卡蹦出来。",
        operations: "操作"
    },
    enumDisplayName: {
        character: "人物",
        stage: "场地"
    },
    other: {
        dat: {
            homeStages: "---主场地（经典模式）---",
            randomData: "---其它信息---",
            paletteNumber: "---配色数---",
            paletteData: "---配色数据---",
            formatUpdated: "已更新为CMC+ V8的dat格式，由CMC Mod Manager赞助修改",
        },
        selector: {
            archives: "档案",
            all: "所有文件"
        },
        autoUpdateFailed: "既然因CMC Mod Manager的安装方式无法自动更新。请直接前往Github或GameBanana下载最新版本。（主页选项卡里有链接。）",
        defaultPageName: "默认",
        languageName: "简体中文 (Simplified Chinese)",
        by: "制作者为"
    }
};