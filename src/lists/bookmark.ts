import {
  ListAction,
  ListContext,
  ListItem,
  BasicList,
  Neovim,
  Uri,
  workspace,
} from 'coc.nvim'
import DB from '../util/db'
import { Position } from 'vscode-languageserver-protocol'

export default class BookmarkList extends BasicList {
  public readonly name = 'bookmark'
  public readonly description = 'list of bookmarks'
  public readonly defaultAction = 'open'
  public actions: ListAction[] = []

  constructor(protected nvim: Neovim, private db: DB) {
    super(nvim)

    this.addLocationActions()

    // bookmark.line might not exists(e.g. be deleted), so it's better to re-implement `open` function
    this.addAction('open', async (item: ListItem) => {
      const { bookmark, path } = item.data
      const pos = Position.create(bookmark.lnum - 1, 0)
      await workspace.jumpTo(Uri.file(path).toString(), pos)
    })

    this.addAction('delete', async (item: ListItem) => {
      const { bookmark, path } = item.data
      const { lnum } = bookmark
      await this.db.delete(path, lnum)
    }, { persist: true, reload: true })
  }

  public async loadItems(_context: ListContext): Promise<ListItem[]> {
    const map = await this.db.load()
    let res: ListItem[] = []
    for (const [path, bookmarks] of map.entries()) {
      for (const bookmark of bookmarks) {
        const { lnum, annotation } = bookmark
        res.push({
          label: `${path.toString()} line: ${lnum}\t\t${annotation ? annotation : ''}`,
          filterText: annotation + path,
          data: Object.assign({}, { path, bookmark }),
          location: {
            uri: Uri.file(path).toString(),
            range: {
              start: { line: bookmark.lnum - 1, character: 0 },
              end: { line: bookmark.lnum - 1, character: 0 }
            }
          }
        })
      }
    }
    return res
  }

  public doHighlight(): void {
    let { nvim } = this
    nvim.pauseNotification()
    nvim.command('syntax match CocBookmarkFilePath /\\v^.*line: \\d+/', true)
    nvim.command('syntax match CocBookmarkAnnotation /\\v\\t.*$/', true)
    nvim.command('highlight default link CocBookmarkFilePath String', true)
    nvim.command('highlight default link CocBookmarkAnnotation Statement', true)
    nvim.resumeNotification().catch(_e => {
      // nop
    })
  }
}
