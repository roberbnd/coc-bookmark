import { workspace, Neovim, Uri } from 'coc.nvim'
import DB from './util/db'
import { BookmarkItem, DocInfo } from './types'

export default class Bookmark {
  constructor(private nvim: Neovim, private db: DB) { }

  private async getDocInfo(): Promise<DocInfo> {
    const doc = await workspace.document
    const lnum = (await this.nvim.call('line', ['.']))
    const line = await this.nvim.line
    const filetype = doc.filetype
    const filepath = Uri.parse(doc.uri).fsPath
    return { lnum, line, filetype, filepath }
  }

  public async create(annotation: string): Promise<void> {
    const { lnum, line, filetype, filepath } = await this.getDocInfo()
    const bookmark: BookmarkItem = {
      lnum,
      line,
      filetype,
      annotation
    }
    await this.db.add(bookmark, filepath)
  }

  public async annotate(): Promise<void> {
    const annotation = await workspace.requestInput('Annotation')
    if (annotation && annotation.trim()) {
      await this.create(annotation.trim())
    }
    await this.refresh()
  }

  public async delete(): Promise<void> {
    const { lnum, filepath } = await this.getDocInfo()
    await this.db.delete(filepath, lnum)
    await this.refresh()
  }

  public async toggle(): Promise<void> {
    const data = await this.db.load()
    const { lnum, filepath } = await this.getDocInfo()
    const bookmarks = data.get(filepath)
    if (bookmarks) {
      if (bookmarks.filter(b => b.lnum === lnum).length !== 0) {
        await this.delete()
        return
      }
    }
    await this.create('')
    await this.refresh()
  }

  public async jumpTo(direction: 'next' | 'prev'): Promise<void> {
    const data = await this.db.load()
    const { filepath, lnum } = await this.getDocInfo()
    const bookmark = data.get(filepath)
    if (bookmark) {
      if (direction === 'next') {
        for (const blnum of bookmark.map(b => b.lnum).sort()) {
          if (blnum > lnum) {
            await workspace.moveTo({
              line: Math.max(blnum - 1, 0),
              character: 0
            })
            return
          }
        }
      } else {
        for (const blnum of bookmark.map(b => b.lnum).sort().reverse()) {
          if (blnum < lnum) {
            await workspace.moveTo({
              line: Math.max(blnum - 1, 0),
              character: 0
            })
            return
          }
        }
      }
    }
  }

  public async update(): Promise<void> {
    // todo
  }

  public async refresh(): Promise<void> {
    // clear all coc-bookmark signs
    const bufnr = (await this.nvim.buffer).id
    await this.nvim.command(`silent! sign unplace * group=coc-bookmark buffer=${bufnr}`)

    // then add signs if exists
    const data = await this.db.load()
    const { filepath } = await this.getDocInfo()
    const bookmarks = data.get(filepath)

    if (bookmarks) {
      for (const bookmark of bookmarks) {
        const { lnum } = bookmark
        this.nvim.command(`sign place ${lnum} line=${lnum} name=CocBookmark group=coc-bookmark buffer=${bufnr}`, true)
      }
    }
  }

  public async clear(all: boolean): Promise<void> {
    if (all) {
      await this.db.clear()
      return
    }
    const data = await this.db.load()
    const { filepath } = await this.getDocInfo()
    const bookmark = data.get(filepath)
    if (bookmark) {
      await this.db.delete(filepath)
    }
    await this.refresh()
  }
}
