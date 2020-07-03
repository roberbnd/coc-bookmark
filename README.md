# coc-bookmark

Bookmark manager extension for [coc.nvim](https://github.com/neoclide/coc.nvim)

![](https://user-images.githubusercontent.com/20282795/84043167-8a819680-a9d8-11ea-9f32-e980ff569a0d.png)

## Install

```
:CocInstall coc-bookmark
```

## Features

- Add/Delete a bookmark
- Add annotation to a bookmark
- Navigate bookmarks with CocList

## Configuration

```jsonc
"bookmark.sign": {
    "type": "string",
    "default": "🔖",
    "description": "Bookmark icon for sign column"
},
"bookmark.signHl": {
  "type": "string",
  "default": "Tag",
  "description": "Highlight group for sign"
}
```

## Commands

- `:CocCommand bookmark.toggle`: create/delete a bookmark
- `:CocCommand bookmark.annotate`: create a bookmark with annotation
- `:CocCommand bookmark.prev`: jump to the prev bookmark
- `:CocCommand bookmark.next`: jump to the next bookmark
- `:CocCommand bookmark.clearForCurrentFile` clear bookmark for the current file",
- `:CocCommand bookmark.clearForAllFiles` clear bookmark for all files",

## User autocmd

- `CocBookmarkChange`: triggered when creating/deleting a bookmark

## Keymaps

- Normal mode: `<Plug>(coc-bookmark-next)`
- Normal mode: `<Plug>(coc-bookmark-prev)`
- Normal mode: `<Plug>(coc-bookmark-toggle)`
- Normal mode: `<Plug>(coc-bookmark-annotate)`

```vim
" Example configuration
nmap <Leader>bj <Plug>(coc-bookmark-next)
nmap <Leader>bk <Plug>(coc-bookmark-prev)
```

## CocList

run `:CocList bookmark` to open the bookmark

- Filter your bookmarks and perform operations via `<Tab>`
- Use `<CR` to jump to the marked file position
- Use `preview` to preview the line you have marked
- Use `delete` to delete a bookmark

## F.A.Q

- Q: Where is the bookmark data stored?

  A: Normally the data is saved in `~/.config/coc/extensions/coc-bookmark-data`, but if you set `g:coc_extension_root` to another location, it will change as well

- Q: The background of bookmark signs are not consistent with signcolumn...

  A: change sign's background according to your colorschrme by putting the following code in your `vimrc`.

  ```vim
  function! s:my_bookmark_color() abort
    let s:scl_guibg = matchstr(execute('hi SignColumn'), 'guibg=\zs\S*')
    if empty(s:scl_guibg)
      let s:scl_guibg = 'NONE'
    endif
    exe 'hi MyBookmarkSign guifg=' . s:scl_guibg
  endfunction
  call s:my_bookmark_color() " don't remove this line!

  augroup UserGitSignColumnColor
    autocmd!
    autocmd ColorScheme * call s:my_bookmark_color()
  augroup END
  ```

  Then set `bookmark.signHl` to `MyBookmarkSign` in your `coc-settings.json`.

  The similar solution can be applied to other extensions/plugins sign color. For instance, see [solutions for git gutter sign](https://github.com/voldikss/dotfiles/blob/06d99c398933f6b9c024793252f2e6f8a25d9d22/home/.config/nvim/init.vim#L333-L355).

- Q: Bookmark sign doesn't show for me

  A: [This](https://github.com/voldikss/coc-bookmark/issues/16#issuecomment-653420019) might be helpful.

## License

MIT
