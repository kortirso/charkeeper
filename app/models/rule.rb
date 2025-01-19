# frozen_string_literal: true

class Rule < ApplicationRecord
  has_many :characters, dependent: :destroy
  has_many :items, dependent: :destroy
  has_many :spells, dependent: :destroy
end
