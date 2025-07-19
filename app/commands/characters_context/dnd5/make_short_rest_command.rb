# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class MakeShortRestCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Dnd5::Character)
        end
      end

      private

      def do_persist(input)
        input[:character].feats.where(limit_refresh: 0).update_all(used_count: 0)

        { result: :ok }
      end
    end
  end
end
