# frozen_string_literal: true

class User < ApplicationRecord
  has_many :characters, dependent: :destroy
  has_many :sessions, class_name: 'User:Session', dependent: :destroy
  has_many :identities, class_name: 'User:Identity', dependent: :destroy
end
