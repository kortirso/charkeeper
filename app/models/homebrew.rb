# frozen_string_literal: true

class Homebrew < ApplicationRecord
  belongs_to :user
  belongs_to :brewery, polymorphic: true
end
