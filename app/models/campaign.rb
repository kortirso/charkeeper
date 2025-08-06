# frozen_string_literal: true

class Campaign < ApplicationRecord
  belongs_to :user

  has_many :campaign_characters, class_name: 'Campaign::Character', dependent: :destroy
  has_many :characters, through: :campaign_characters
end
