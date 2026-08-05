# frozen_string_literal: true

class CustomResource < ApplicationRecord
  belongs_to :resourceable, polymorphic: true

  has_many :character_resources, class_name: 'Character::Resource', dependent: :destroy
end
