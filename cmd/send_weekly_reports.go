package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	conf "github.com/muety/wakapi/config"
	"github.com/muety/wakapi/internal/utilities"
	"github.com/muety/wakapi/services"
)

var sendWeeklyReportsCmd = &cobra.Command{
	Use:   "send-weekly-reports",
	Short: "sends weekly report emails to all users",
	Long:  `sends weekly report emails to all users who have reports enabled.`,
	Run: func(cmd *cobra.Command, args []string) {
		sendWeeklyReportsToAllUsers()
	},
}

func init() {
	rootCmd.AddCommand(sendWeeklyReportsCmd)

	sendWeeklyReportsCmd.Flags().StringVar(&cfgFile, "config", conf.DefaultConfigPath, fmt.Sprintf("config file (default is %s)", conf.DefaultConfigPath))
}

func sendWeeklyReportsToAllUsers() {
	config := conf.Load(cfgFile, "0.00.01")
	db, sqlDB, err := utilities.InitDB(config)

	if err != nil {
		conf.Log().Fatal("could not connect to database", "error", err)
		os.Exit(1)
		return
	}

	defer sqlDB.Close()

	reportService := services.NewReportService(db)

	fmt.Println("Sending weekly reports to all users...")

	if err := reportService.SendWeeklyReports(); err != nil {
		conf.Log().Error("failed to send weekly reports", "error", err)
		os.Exit(1)
	}

	fmt.Println("Successfully sent weekly reports to all eligible users.")
}