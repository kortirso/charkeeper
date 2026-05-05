# frozen_string_literal: true

class CustomResource < ApplicationRecord
  belongs_to :resourceable, polymorphic: true
end
