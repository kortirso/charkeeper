# frozen_string_literal: true

class Character < ApplicationRecord
  belongs_to :rule
  belongs_to :user

  has_many :items, class_name: 'Character::Item', dependent: :destroy
end
