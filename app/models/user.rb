# frozen_string_literal: true

class User < ApplicationRecord
  include ActiveModel::SecurePassword

  has_secure_password

  has_many :characters, dependent: :destroy
  has_many :sessions, class_name: 'User::Session', dependent: :destroy
  has_many :identities, class_name: 'User::Identity', dependent: :destroy
  has_many :feedbacks, class_name: 'User::Feedback', dependent: :destroy
end
