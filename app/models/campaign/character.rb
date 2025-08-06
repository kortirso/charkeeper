# frozen_string_literal: true

class Campaign
  class Character < ApplicationRecord
    belongs_to :campaign
    belongs_to :character
  end
end
