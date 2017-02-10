/*
*
*   Plugin developed by Dimitri Conejo
*   www.dimitriconejo.com
*
*/

CKEDITOR.plugins.add( 'videodetector', {
    icons: 'videodetector',
    lang: 'en,ru',
    init: function( editor ) {

        var lex = this.lex = function (name) {
            var result = name;

            if (editor.lang.videodetector && editor.lang.videodetector[name]) {
                result = editor.lang.videodetector[name];
            } else if (editor.lang.common && editor.lang.common[name]) {
                result = editor.lang.common[name];
            }

            return result;
        };

        editor.addContentsCss(this.path + '/videodetector.css');

        editor.addCommand('videodetector', new CKEDITOR.dialogCommand('videoDialog', {
            allowedContent: 'div(videodetector*)[data-*]; iframe[!src,*];'
        }));

        editor.ui.addButton('VideoDetector', {
            label: lex('insert'),
            command: 'videodetector',
            toolbar: 'insert',
        });

        if (editor.contextMenu) {
            editor.addMenuGroup( 'videodetector' );

            editor.addMenuItems({
                videodetectorInsert: {
                    label: lex('insert'),
                    icon: this.path + 'icons/videodetector.png',
                    command: 'videodetector',
                    group: 'videodetector'
                },
                videodetectorEdit: {
                    label: lex('edit'),
                    icon: this.path + 'icons/videodetector.png',
                    command: 'videodetector',
                    group: 'videodetector'
                },
                videodetectorRemove: {
                    label: lex('remove'),
                    group: 'videodetector',
                    onClick: function () {
                        var selection = editor.getSelection(),
                            element = selection.getStartElement();

                        if (element) {
                            element.remove();
                        }
                    },
                }
            });

            editor.contextMenu.addListener( function( element ) {
                if (element.hasClass('videodetector') && element.findOne('>iframe')) {
                    editor.contextMenu.items = [];
                    return {
                        videodetectorEdit: CKEDITOR.TRISTATE_OFF,
                        videodetectorRemove: CKEDITOR.TRISTATE_OFF,
                    };
                }
                return {
                    videodetectorInsert: CKEDITOR.TRISTATE_OFF,
                };
            });
        }

        CKEDITOR.dialog.add('videoDialog', this.path + 'dialogs/videoDialog.js');

    }
});
