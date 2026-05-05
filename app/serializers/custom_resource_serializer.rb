# frozen_string_literal: true

class CustomResourceSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id name description max_value resets reset_direction].freeze

  attributes(*ATTRIBUTES)
end
