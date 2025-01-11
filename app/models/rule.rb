# frozen_string_literal: true

class Rule < ApplicationRecord
  has_many :characters, dependent: :destroy
end
