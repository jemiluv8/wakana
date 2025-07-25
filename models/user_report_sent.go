package models

import "time"

// UserReportSent represents a record indicating that a weekly report has been sent
// for a specific user for a specific week (identified by the Monday date).
// Used to prevent duplicate emails in a distributed environment.
type UserReportSent struct {
	ID         uint      `gorm:"primaryKey"`
	UserID     string    `gorm:"not null;uniqueIndex:idx_user_report_date"`
	ReportDate time.Time `gorm:"not null;uniqueIndex:idx_user_report_date"`
	SentAt     time.Time `gorm:"not null"`

	User User `gorm:"foreignKey:UserID"`
}

// TableName specifies the table name for GORM
func (UserReportSent) TableName() string {
	return "user_reports_sent"
}
