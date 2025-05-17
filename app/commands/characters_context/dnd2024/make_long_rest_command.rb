# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class MakeLongRestCommand < CharactersContext::Dnd5::MakeLongRestCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Dnd2024::Character)
        end
      end
    end
  end
end
