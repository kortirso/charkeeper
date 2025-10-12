# frozen_string_literal: true

class Campaign
  class Channel < ApplicationRecord
    belongs_to :campaign
    belongs_to :channel
  end
end
