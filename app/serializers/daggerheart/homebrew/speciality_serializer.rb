# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class SpecialitySerializer < ApplicationSerializer
      attributes :id, :name, :evasion, :health_max, :domains

      delegate :evasion, :health_max, :domains, to: :data
      delegate :data, to: :object
    end
  end
end
