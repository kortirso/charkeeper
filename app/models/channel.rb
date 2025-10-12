# frozen_string_literal: true

class Channel < ApplicationRecord
  TELEGRAM = 'telegram'

  enum :provider, { TELEGRAM => 0 }
end
