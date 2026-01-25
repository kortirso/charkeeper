# frozen_string_literal: true

class Campaign
  class Note < ApplicationRecord
    belongs_to :campaign, class_name: '::Campaign'
  end
end
