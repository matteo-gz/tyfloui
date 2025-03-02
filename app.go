package main

import (
	"context"
	"fmt"
	"log"

	"github.com/matteo-gz/tyflo/pkg/tunnel"
)

// App struct
type App struct {
	ctx       context.Context
	sshTunnel tunnel.SshI
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) StartProxy(file string, host string, port int, user string, socks5Port int) (ok bool, message string) {
	a.sshTunnel = tunnel.NewSshTunnel()
	err := a.sshTunnel.Connect(file, user, host, port)
	if err != nil {
		log.Println("ssh连接失败", err)
		return false, err.Error()
	}
	err = a.sshTunnel.Start(socks5Port)
	if err != nil {
		log.Println("ssh隧道启动失败", err)
		return false, err.Error()
	}
	log.Println("ssh隧道启动成功")
	return true, "success"
}

func (a *App) StopProxy() (ok bool, message string) {
	if a.sshTunnel == nil {
		log.Println("sshTunnel is nil")
		return false, "sshTunnel is nil"
	}
	err := a.sshTunnel.Close()
	if err != nil {
		log.Println("ssh隧道关闭失败", err)
		return false, err.Error()
	}
	log.Println("ssh隧道关闭成功")
	return true, "success"
}
