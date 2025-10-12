# frozen_string_literal: true

class Campaign
  class Character < ApplicationRecord
    belongs_to :campaign, class_name: '::Campaign'
    belongs_to :character, class_name: '::Character'
  end
end
