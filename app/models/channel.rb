# frozen_string_literal: true

class Channel < ApplicationRecord
  TELEGRAM = 'telegram'

  has_one :campaign_channel, class_name: 'Campaign::Channel', dependent: :destroy
  has_one :campaign, through: :campaign_channel

  enum :provider, { TELEGRAM => 0 }
end
