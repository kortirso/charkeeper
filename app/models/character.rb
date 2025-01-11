# frozen_string_literal: true

class Character < ApplicationRecord
  belongs_to :rule
  belongs_to :user
end
