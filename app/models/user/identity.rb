# frozen_string_literal: true

class User
  class Identity < ApplicationRecord
    TELEGRAM = 'telegram'

    belongs_to :user

    enum :provider, { TELEGRAM => 0 }
  end
end
