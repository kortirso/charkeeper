# frozen_string_literal: true

class User
  class Identity < ApplicationRecord
    TELEGRAM = 'telegram'
    GOOGLE = 'google'
    DISCORD = 'discord'
    YANDEX = 'yandex'

    belongs_to :user

    enum :provider, { TELEGRAM => 0, GOOGLE => 1, DISCORD => 2, YANDEX => 3 }

    scope :telegram, -> { where(provider: TELEGRAM) }
    scope :active, -> { where(active: true) }
  end
end
