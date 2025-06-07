/* eslint-disable @stylistic/js/max-len */
export default {
    operation: {
        update: {
            download: {
                started: {
                    title: "ダウンロード更新",
                    body: "最新バージョンのCMC Mod Managerがダウンロードしています。",
                },
                finished: {
                    title: "ダウンロード更新完了",
                    body: "最新バージョンのCMC Mod Managerがダウンロードされました。"
                }
            },
            install: {
                started: {
                    title: "インストール更新",
                    body: "最新バージョンのCMC Mod Managerがインストールしています。"
                },
                finished: {
                    body: "CMC Mod Managerを閉じて更新を完了してください。"
                }
            }
        },
        mod: {
            download: {
                started: {
                    title: "modダウンロード",
                    body: "GameBananaからmodをダウンロードしています。"
                },
                progress: {
                    0: {
                        title: "{0} ダウンロード",
                        body: "GameBananaから'{0}'modをダウンロード中です。",
                    },
                    1: {
                        body: "ダウンロードしたmodを抽出中です。",
                    },
                },
                finished: {
                    body: "GameBananaから'{0}'modのダウンロードが完了しました。"
                }
            }
        },
        character: {
            bulkInstallation: {
                started: {
                    title: "キャラクターの一括インストール",
                    body: "'{0}'からインストールするキャラクターを選択してください。"
                },
                finished: {
                    body: "'{0}'からインストールするキャラクターが選択されました。"
                }
            },
            installation: {
                started: {
                    title: "キャラクターのインストール",
                    body: "{0}からキャラクターをインストール中です。"
                },
                finished: {
                    body: "{1}から'{0}'キャラクターのインストールが完了しました。"
                }
            },
            randomSelection: {
                started: {
                    title: "キャラクター選択",
                    body: "'{0}'のランダム選択設定を調整中です。"
                },
                finished: {
                    body: "'{0}'のランダム選択設定が調整されました。"
                }
            },
            deletion: {
                started: {
                    title: "キャラクターの削除",
                    body: "キャラクター'{0}'を削除中です。"
                },
                finished: {
                    body: "キャラクター'{0}'を削除しました。"
                }
            },
            extraction: {
                started: {
                    title: "キャラクターの抽出",
                    body: "キャラクター'{0}'を抽出中です。"
                },
                finished: {
                    body: "キャラクター'{0}'を抽出しました。"
                }
            },
            seriesDeletion: {
                started: {
                    title: "シリーズの削除",
                    body: "同じシリーズのすべてのキャラクター'{0}'を削除中です。"
                },
                finished: {
                    body: "同じシリーズのすべてのキャラクター'{0}'を削除しました。"
                }
            }
        },
        stage: {
            bulkInstallation: {
                started: {
                    title: "ステージの一括インストール",
                    body: "'{0}'からインストールするステージを選択してください。"
                },
                finished: {
                    body: "'{0}'からインストールするステージが選択されました。"
                }
            },
            installation: {
                started: {
                    title: "ステージのインストール",
                    body: "{0}からステージをインストール中です。"
                },
                finished: {
                    body: "{1}から'{0}'ステージのインストールが完了しました。"
                }
            },
            randomSelection: {
                started: {
                    title: "ステージ選択",
                    body: "'{0}'のランダム選択設定を調整中です。"
                },
                finished: {
                    body: "'{0}'のランダム選択設定が調整されました。"
                }
            },
            deletion: {
                started: {
                    title: "ステージの削除",
                    body: "ステージ'{0}'を削除中です。"
                },
                finished: {
                    body: "ステージ'{0}'を削除しました。"
                }
            },
            extraction: {
                started: {
                    title: "ステージの抽出",
                    body: "ステージ'{0}'を抽出中です。"
                },
                finished: {
                    body: "ステージ'{0}'を抽出しました。"
                }
            },
            seriesDeletion: {
                started: {
                    title: "シリーズの削除",
                    body: "同じシリーズのすべてのステージ'{0}'を削除中です。"
                },
                finished: {
                    body: "同じシリーズのすべてのステージ'{0}'を削除しました。"
                }
            }
        },
        alt: {
            include: {
                started: {
                    title: "代替バージョンの包含",
                    body: "この代替バージョンがキャラクターリストに含まれていることを確認中です。"
                },
                finished: {
                    body: "この代替バージョンがキャラクターリストに含まれていることを確認しました。"
                }
            },
            exclude: {
                started: {
                    title: "代替バージョンの除外",
                    body: "この代替バージョンがキャラクターリストから除外されていることを確認中です。"
                },
                finished: {
                    body: "この代替バージョンがキャラクターリストから除外されていることを確認しました。"
                }
            },
            removal: {
                started: {
                    title: "代替バージョンのアンインストール",
                    body: "キャラクター'{1}'から代替バージョン'{0}'をアンインストール中です。"
                },
                finished: {
                    body: "キャラクター'{1}'から代替バージョン'{0}'をアンインストールしました。"
                }
            },
            addition: {
                started: {
                    title: "代替バージョンの追加",
                    body: "キャラクター'{1}'に代替バージョン'{0}'を追加中です。"
                },
                finished: {
                    body: "キャラクター'{1}'に代替バージョン'{0}'を追加しました。"
                }
            }
        },
        css: {
            writeData: {
                started: {
                    title: "CSSファイルの編集",
                    body: "修正したCSSファイルデータをページ'{0}'に書き込み中です。"
                },
                finished: {
                    body: "修正したCSSファイルデータをページ'{0}'に書き込みました。"
                }
            },
            reorderPages: {
                started: {
                    title: "CSSページの並べ替え",
                    body: "CSSページ'{0}'をインデックス{1}に移動中です。"
                },
                finished: {
                    body: "CSSページ'{0}'をインデックス{1}に移動しました。"
                }
            },
            pageAddition: {
                started: {
                    title: "新規CSSページの追加",
                    body: "新しいCSSページ'{0}'を追加中です。"
                },
                finished: {
                    body: "新しいCSSページ'{0}'を追加しました。"
                }
            },
            renamePage: {
                started: {
                    title: "CSSページの名前変更",
                    body: "CSSページ'{0}'の名前を'{1}'に変更中です。"
                },
                finished: {
                    body: "CSSページ'{0}'の名前を'{1}'に変更しました。"
                }
            },
            pageDeletion: {
                started: {
                    title: "CSSページの削除",
                    body: "CSSページ'{0}'を削除中です。"
                },
                finished: {
                    body: "CSSページ'{0}'を削除しました。"
                }
            }
        },
        sss: {
            writeData: {
                started: {
                    title: "SSSファイルの編集",
                    body: "修正したSSSファイルデータをページ'{0}'に書き込み中です。"
                },
                finished: {
                    body: "修正したSSSファイルデータをページ'{0}'に書き込みました。"
                }
            },
            reorderPages: {
                started: {
                    title: "SSSページの並べ替え",
                    body: "SSSページ'{0}'をインデックス{1}に移動中です。"
                },
                finished: {
                    body: "SSSページ'{0}'をインデックス{1}に移動しました。"
                }
            },
            pageAddition: {
                started: {
                    title: "新規CSSページの追加",
                    body: "新しいCSSページ'{0}'を追加中です。"
                },
                finished: {
                    body: "新しいCSSページ'{0}'を追加しました。"
                }
            },
            renamePage: {
                started: {
                    title: "CSSページの名前変更",
                    body: "CSSページ'{0}'の名前を'{1}'に変更中です。"
                },
                finished: {
                    body: "CSSページ'{0}'の名前を'{1}'に変更しました。"
                }
            },
            pageDeletion: {
                started: {
                    title: "CSSページの削除",
                    body: "CSSページ'{0}'を削除中です。"
                },
                finished: {
                    body: "CSSページ'{0}'を削除しました。"
                }
            }
        }
    },
    dialog: {
        alert: {
            selfContainedDir: {
                title: "無効ゲーム位置警告",
                body: "選択したゲームディレクトリにはCMC Mod Manager自身のディレクトリが含まれています。CMC Mod Managerは更新中にディレクトリ内のすべてのファイルを削除するため、このディレクトリはゲームファイルの保存には使用できません。ゲームファイルを別の場所に移動してください。"
            },
            invalidGameDir: {
                title: "選択されたディレクトリは無効です",
                body: "認識可能な実行ファイルの1つが含まれていないため、選択したディレクトリは無効です。"
            },
            postUpdate: {
                title: "更新メッセージ",
                body: "CMC Mod Managerの更新ありがとうございます！ そのCMC Mod Managerサイトも更新されましたので、ぜひご覧ください：https://inferno214221.com/CMC-mod-manager/ （'home'タブにも公開リンクがあります。）このプロジェクトをサポートしたい場合は、'Buy Me A Coffee'のページでサポートできます！"
            },
            noDirSelected: {
                title: "ディレクトリが選択されていません",
                body: "CMC+があるディレクトリを選択して、操作を続けてください。"
            },
            languageUpdated: {
                title: "言語の更新",
                body: "CMC Mod Managerを閉じて再起動し、更新を適用してください。翻訳者はkirbyTV！"
            },
            licenseNotice: {
                title: "ライセンス通知",
            }
        },
        confirm: {
            programUpdate: {
                title: "プログラム更新",
                body: "CMC Mod Managerは現在更新する必要があります。この更新プログラムは自動的にインストールされ、CMC Mod Managerと同じディレクトリ内のすべてのファイルが削除されます。問題がある場合は、この更新プログラムをキャンセルし、影響を受けるファイルを削除してください。",
                okLabel: "確認"
            },
            destructiveAction: {
                title: "リスク行動確認",
                body: "この操作には一定のリスクがあり、後で取り消すことはできません。本当にこの操作を続けますか？",
                okLabel: "確認"
            },
            closeUnfinishedOperations: {
                title: "未完了の操作",
                body: "本当にCMC Mod Managerをオフにしますか？まだ操作が完了していません。プログラムが閉じられた場合（または再ロードされた場合）、これらの操作はキャンセルされます。",
                okLabel: "とにかく閉じる"
            },
            beginCharacterInput: {
                title: "キャラクターインストール",
                body: "インストール中のキャラクターのdatファイルはSSBCの形式であり、datファイルにインストール情報を入力する必要があります。この情報は通常、Modのトップレベルディレクトリ内のtxtファイルにサンプルとして含まれています。",
                okLabel: "確認"
            },
            openCharacterDir: {
                title: "キャラクターインストール",
                body: "txtファイルを探すためにmod自身のディレクトリを開きますか？",
                okLabel: "はい",
                cancelLabel: "いいえ"
            },
            beginStageInput: {
                title: "ステージインストール",
                body: "これはCMCのマップ移植なので、インストール中のマップに関する情報を入力してください。この情報は通常、modのトップレベルディレクトリ内のtxtファイルにサンプルとして含まれています。（このtxtファイルが存在し、4行が書かれている場合、通常最初の行は無視できます。）",
                okLabel: "確認"
            },
            openStageDir: {
                title: "ステージインストール",
                body: "txtファイルを探すためにmod自身のディレクトリを開きますか？",
                okLabel: "はい",
                cancelLabel: "いいえ"
            }
        },
        prompt: {
            characterMenuName: {
                title: "キャラクターインストール",
                body: "キャラクターの「メニュー名」を入力してください（キャラクター選択画面でこのキャラクターが選択されたときに表示される名前）",
                placeholder: "キャラクターのメニュー名"
            },
            characterBattleName: {
                title: "キャラクターインストール",
                body: "キャラクターの「バトル名」を入力してください（対戦中にアバターフレーム近くに名前画像がない場合に直接表示される名前）",
                placeholder: "キャラクターのバトル名",
            },
            characterSeries: {
                title: "キャラクターインストール",
                body: "キャラクターの「シリーズ名」を入力してください（キャラクター選択画面でキャラクターが選択されたときに背景画面に表示されるアイコンに使用されます。通常は短く省略されています）",
                placeholder: "キャラクターのシリーズ名",
            },
            stageMenuName: {
                title: "ステージインストール",
                body: "ステージの「メニュー名」を入力してください（ステージ選択画面でこのステージが選択されたときに表示される名前）",
                placeholder: "ステージのメニュー名"
            },
            stageSource: {
                title: "ステージインストール",
                body: "ステージの「出典作品」を入力してください（ステージの「メニュー名」の下に表示され、通常はこのシーンが元々どの作品から来たかを示します）",
                placeholder: "ステージの出典作品",
            },
            stageSeries: {
                title: "ステージインストール",
                body: "ステージの「シリーズ名」を入力してください（ステージ選択画面でステージが選択されたときにプレビューの右上に表示されるアイコンに使用されます。通常は短く省略されています）",
                placeholder: "ステージのシリーズ名",
            }
        },
        defaults: {
            okLabel: "はい",
            cancelLabel: "いいえ"
        },
        notification: {
            oneClickDownload: {
                title: "ワンクリックインストールが初期化されました",
                body: "GameBananaからID '{0}'のmodをダウンロード中です。"
            }
        },
        installation: {
            character: {
                title: "インストールするキャラクターを選択"
            },
            stage: {
                title: "インストールするステージを選択"
            }
        }
    },
    error: {
        noStringFound: "キーの文字列を取得できません：'{0}'。",
        invalidStringArgs: "文字列の代入時にパラメータの個数が無効です。",
        missingDialogOptions: "ダイアログは神隠しにされている。",
        unsupportedArchiveType: "サポートされていないArchiveタイプ：'{0}'。",
        unknownModType: "サポートされていないmodタイプ：'{0}'。",
        invalidSemverString: "無効なSemver文字列：'{0}'。",
        cantUpdateDevMode: "なぜ開発モードで更新したのか自分で反省する",
        missingUpdateFiles: "ファイルを更新したは森で行方不明になったのか？",
        streamError: "転送エラー：'{0}'。",
        noSingleInstanceLock: "サンプルのロックに失敗しました。",
        noRecursiveAlts: "代替バージョンのあるキャラクターは別のキャラクターの代替バージョンになることはできない",
        maxAltsReached: "このキャラクターの代替バージョンの許容数は上限に達しました、他の人を探しましょう。",
        characterNotFound: "このキャラクターは行方不明になった：'{0}'。",
        stageNotFound: "このステージは解体された：'{0}'。",
        incompleteDat: "キャラクターのdatは完全ではない：'{0}'。",
        characterInstallTargetSelf: "同じキャラクターをインストールした場所にキャラクターをインストールすることはできません。理解してくれてありがとう~",
        stageInstallTargetSelf: "同じステージをインストールした場所にステージをインストールすることはできません。理解してくれてありがとう~",
        noValidCharactersFound: "無効なキャラクターばかりだ：'{0}'。",
        noValidStagesFound: "無効なステージばかりだ：'{0}'。",
        noTopDir: "このファイルパスにはディレクトリさえありません：'{0}'。",
        noFighterSubdir: "あなたのこのディレクトリから「fighter」というサブディレクトリが見つかりません：'{0}'。",
        noStageSubdir: "あなたのこのディレクトリから「stage」というサブディレクトリが見つかりません：'{0}'。",
        noUpdateCharacter: "キャラクターはインストールされており、更新は無効です。",
        noUpdateStage: "ステージはインストールされており、更新は無効です。",
        noDatFile: "こ の キ ャ ラ ク タ ー に は dat フ ァ イ ル が あ り ま せ ん 。 ",
        customCssDisabled: "カスタムCSSページはすでにgame_settingsで閉じられています。",
        operationCallNotFound: "操作関数が見つかりません：'{0}'。"
    },
    tooltip: {
        character: {
            install: "インストールキャラクター",
            update: "更新キャラクター",
            search: "検索キャラクター",
            installDir: "カタログからキャラクターをインストールする",
            installArch: "Archiveからキャラクターをインストールする",
            delete: "削除キャラクター",
            extract: "抽出キャラクター",
            deleteSeries: "このシリーズのすべてのキャラクターを削除します",
            showing: {
                all: "展示のみ：すべてのキャラクター",
                new: "展示のみ：新しいキャラクター",
                excluded: "展示のみ：除外されたキャラクター"
            },
            existing: {
                update: "既存キャラクター：更新",
                abort: "既存キャラクター：中止する"
            }
        },
        stage: {
            install: "インストールステージ",
            update: "更新ステージ",
            search: "検索ステージ",
            installDir: "カタログからステージをインストールする",
            installArch: "Archiveからステージをインストールする",
            delete: "削除ステージ",
            extract: "抽出ステージ",
            deleteSeries: "このシリーズのすべてのステージを削除します",
            showing: {
                all: "展示のみ：すべてのシリーズ",
                new: "展示のみ：新しいシリーズ",
                excluded: "展示のみ：除外されたシリーズ"
            },
            existing: {
                update: "既存シリーズ：更新",
                abort: "既存シリーズ：中止する"
            }
        },
        alt: {
            remove: "削除代替バージョン",
            addition: {
                toThis: "このキャラクターに代替バージョンを追加する",
                thisFor: "このキャラクターを代替バージョンとして選択する",
                cancel: "代替バージョンの追加をキャンセルする"
            },
            asCharacters: {
                included: "代替バージョン：キャラクターを含む",
                excluded: "代替バージョン：キャラクターから除外する"
            }
        },
        ss: {
            addPage: "ページ数を増やす",
            deletePage: "ページ数の削除",
            column: {
                add: "列を追加する",
                remove: "列をつ減らす"
            },
            row: {
                add: "行を追加する",
                remove: "行をつ減らす"
            }
        },
        sortBy: {
            number: "ソートキー：内部登録番号数",
            series: "ソートキー：シリーズ名",
            alphabetical: "ソートキー：アルファベット順"
        },
        sortDirection: {
            backwards: "ソート方向：後ろ",
            forwards: "ソート方向：前"
        },
        installation: {
            filter: "インストール：必要なも",
            all: "インストール：全部もらいます"
        },
        randomSelection: {
            enabled: "ランダムに選択できる：有効化",
            disabled: "ランダムに選択できる：無効化"
        },
        operationPanel: {
            show: "操作を表示",
            hide: "操作を隠す"
        },
        operation: {
            cancel: "操作を取り消す"
        },
        gameDir: {
            noneSelected: "（選択された空気）",
            change: "CMC+ディレクトリの変更",
            open: "CMC+ディレクトリを開く",
            run: "CMC+を起動する"
        },
        site: {
            homepage: "ホームページ"
        },
        closeWindow: "ウィンドウを閉じる",
        openExtractionDir: "抽出ディレクトリを開く",
        openExtractedFiles: "抽出したファイルを開く"
    },
    ui: {
        tabs: {
            home: {
                title: "ホームページ"
            },
            characters: {
                title: "キャラクター",
                desc: "CMC+をインストール、抽出、または削除したキャラクター。"
            },
            characterSelectionScreen: {
                title: "キャラクター選択インタフェースする",
                desc: "CMC+のキャラクター選択インタフェースを編集します。"
            },
            stages: {
                title: "シリーズ",
                desc: "CMC+をシリーズ、抽出、または削除したキャラクター。"
            },
            stageSelectionScreen: {
                title: "シリーズ選択インタフェースする",
                desc: "CMC+のシリーズ選択インタフェースを編集します。"
            }
        },
        currentGameDir: "現在のCMC+ディレクトリ: ",
        searchPlaceholder: "検索",
        pagePlaceholder: "ページ名",
        showLicense: "証書を表示する（GNU GPLv3）",
        errorDisplay: "ここでエラーが発生したのはあなたがやったのではなく、タブの飛び出しを阻止したのかもしれません。",
        operations: "操作"
    },
    enumDisplayName: {
        character: "キャラクター",
        stage: "シリーズ"
    },
    other: {
        dat: {
            homeStages: "---ホームシリーズ「シンプル」---",
            randomData: "---その他の情報---",
            paletteNumber: "---Palette数---",
            paletteData: "---Paletteデータ---",
            formatUpdated: "CMC+ V8のdat形式に更新されました。CMC Mod Managerがスポンサーとなって修正しました",
        },
        selector: {
            archives: "ファイル",
            all: "すべてのファイル"
        },
        autoUpdateFailed: "CMC Mod Managerが自動的に更新できない以上。GithubまたはGameBananaに直接行って最新バージョンをダウンロードしてください。 （ホームページタブにリンクがあります。）",
        defaultPageName: "デフォルト",
        languageName: "日本語 (Japanese)",
        by: "制作者は"
    }
};