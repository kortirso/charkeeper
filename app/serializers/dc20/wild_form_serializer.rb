# frozen_string_literal: true

module Dc20
  class WildFormSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id name data].freeze

    attributes(*ATTRIBUTES)
  end
end
