package routes

import (
	"fmt"
	"github.com/muety/wakapi/models"
	"github.com/muety/wakapi/utils"
	"html/template"
	"io/ioutil"
	"path"
	"strings"
)

func init() {
	loadTemplates()
}

var templates map[string]*template.Template

func loadTemplates() {
	tplPath := "views"
	tpls := template.New("").Funcs(template.FuncMap{
		"json":       utils.Json,
		"date":       utils.FormatDateHuman,
		"title":      strings.Title,
		"capitalize": utils.Capitalize,
		"getBasePath": func() string {
			return models.GetConfig().BasePath
		},
	})
	templates = make(map[string]*template.Template)

	files, err := ioutil.ReadDir(tplPath)
	if err != nil {
		panic(err)
	}

	for _, file := range files {
		tplName := file.Name()
		if file.IsDir() || path.Ext(tplName) != ".html" {
			continue
		}

		tpl, err := tpls.New(tplName).ParseFiles(fmt.Sprintf("%s/%s", tplPath, tplName))
		if err != nil {
			panic(err)
		}

		templates[tplName] = tpl
	}
}