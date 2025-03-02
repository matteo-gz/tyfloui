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

type Test1Result struct {
	Ok      bool
	Message string
}

func (a *App) Test1() Test1Result {
	return Test1Result{Ok: true, Message: "success"}
}

type StartProxyResult struct {
	Ok      bool
	Message string
}

func (a *App) StartProxy(file string, host string, port int, user string, socks5Port int) StartProxyResult {
	if a.sshTunnel != nil {
		a.StopProxy()
		log.Println("ssh隧道已启动，先关闭")
	}
	a.sshTunnel = tunnel.NewSshTunnel()
	err := a.sshTunnel.ConnectByPrivateKey(file, user, host, port)
	if err != nil {
		log.Println("ssh连接失败", err)
		return StartProxyResult{Ok: false, Message: err.Error()}
	}
	err = a.sshTunnel.Start(socks5Port)
	if err != nil {
		log.Println("ssh隧道启动失败", err)
		return StartProxyResult{Ok: false, Message: err.Error()}
	}
	log.Println("ssh隧道启动成功")
	return StartProxyResult{Ok: true, Message: "success"}
}

type StopProxyResult struct {
	Ok      bool
	Message string
}

func (a *App) StopProxy() StopProxyResult {
	if a.sshTunnel == nil {
		log.Println("sshTunnel is nil")
		return StopProxyResult{Ok: false, Message: "sshTunnel is nil"}
	}
	err := a.sshTunnel.Close()
	if err != nil {
		log.Println("ssh隧道关闭失败", err)
		return StopProxyResult{Ok: false, Message: err.Error()}
	}
	log.Println("ssh隧道关闭成功")
	return StopProxyResult{Ok: true, Message: "success"}
}
