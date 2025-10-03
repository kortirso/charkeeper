# frozen_string_literal: true

class User
  class Homebrew < ApplicationRecord
    belongs_to :user
  end
end
