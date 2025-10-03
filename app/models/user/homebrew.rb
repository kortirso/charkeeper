# frozen_string_literal: true

class User
  class Homebrew < ApplicationRecord
    belongs_to :user

    before_save :generate_default_data

    private

    def generate_default_data
      return if data.keys.any?

      self.data = {
        daggerheart: {},
        dnd2024: {}
      }
    end
  end
end
