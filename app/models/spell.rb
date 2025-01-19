# frozen_string_literal: true

class Spell < ApplicationRecord
  belongs_to :rule
end
