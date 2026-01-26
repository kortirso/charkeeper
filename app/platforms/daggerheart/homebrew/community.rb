# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class Community < ::Homebrew::Community
      include Discard::Model
    end
  end
end
