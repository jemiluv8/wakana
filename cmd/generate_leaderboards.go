package cmd

import (
	"fmt"
	"os"
	"time"

	"github.com/spf13/cobra"

	conf "github.com/muety/wakapi/config"
	"github.com/muety/wakapi/internal/utilities"
	"github.com/muety/wakapi/services"
)

var generateLeaderboardsCmd = &cobra.Command{
	Use:   "generate-leaderboards",
	Short: "Generate leaderboards for the previous complete week (Monday to Sunday)",
	Long: `Generate leaderboards for ALL users regardless of their leaderboard settings.

This command generates leaderboards for the previous complete week from Monday 00:00:00 to Sunday 23:59:59.
For example:
- If run on a Wednesday, it generates leaderboards for last Monday to last Sunday
- If run on a Sunday, it generates leaderboards for last Monday to last Sunday (not the current week)
- If run on a Monday, it generates leaderboards for the week that just ended (last Monday to yesterday)

This ensures consistent weekly leaderboard periods that align with calendar weeks.
All users are included in the leaderboard generation, even if they have disabled leaderboards in their settings.`,
	Run: func(cmd *cobra.Command, args []string) {
		generateLeaderboards()
	},
}

func init() {
	rootCmd.AddCommand(generateLeaderboardsCmd)

	generateLeaderboardsCmd.Flags().StringVar(&cfgFile, "config", conf.DefaultConfigPath, fmt.Sprintf("config file (default is %s)", conf.DefaultConfigPath))
}

func generateLeaderboards() {
	config := conf.Load(cfgFile, "0.00.01")
	
	if !config.App.LeaderboardEnabled {
		fmt.Println("Leaderboards are disabled in configuration. Enable them to generate leaderboards.")
		os.Exit(1)
		return
	}
	
	db, sqlDB, err := utilities.InitDB(config)
	if err != nil {
		conf.Log().Fatal("could not connect to database", "error", err)
		os.Exit(1)
		return
	}
	defer sqlDB.Close()

	// Create services
	services := services.NewServices(db)
	leaderboardService := services.LeaderBoard()

	executionStart := time.Now()
	if err := leaderboardService.GenerateWeeklyLeaderboards(); err != nil {
		conf.Log().Error("failed to generate leaderboards", "error", err)
		fmt.Printf("Error: Failed to generate leaderboards: %v\n", err)
		os.Exit(1)
	}

	duration := time.Since(executionStart)
	fmt.Printf("Successfully generated leaderboards for all eligible users in %v.\n", duration)
}