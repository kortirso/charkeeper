# frozen_string_literal: true

class User < ApplicationRecord
  include ActiveModel::SecurePassword

  LIGHT = 'light'
  DARK = 'dark'

  has_secure_password

  has_many :characters, dependent: :destroy
  has_many :sessions, class_name: 'User::Session', dependent: :destroy
  has_many :identities, class_name: 'User::Identity', dependent: :destroy
  has_many :feedbacks, class_name: 'User::Feedback', dependent: :destroy
  has_many :notifications, class_name: 'User::Notification', dependent: :destroy
  has_many :platforms, class_name: 'User::Platform', dependent: :destroy
  has_many :homebrews, dependent: :destroy
  has_many :feats, dependent: :destroy
  has_many :items, dependent: :destroy
  has_many :campaigns, dependent: :destroy
  has_many :homebrew_books, class_name: 'Homebrew::Book', dependent: :destroy
  has_many :active_bot_objects, dependent: :destroy

  enum :color_schema, { LIGHT => 0, DARK => 1 }
end
