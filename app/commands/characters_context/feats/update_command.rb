# frozen_string_literal: true

module CharactersContext
  module Feats
    class UpdateCommand < BaseCommand
      use_contract do
        params do
          required(:feat).filled(type?: ::Feat)
          required(:title).filled(:string, max_size?: 50)
          required(:description).filled(:string, max_size?: 1_000)
        end
      end

      private

      def do_prepare(input)
        input[:title] = { en: sanitize(input[:title]) }
        input[:description] = { en: sanitize(input[:description]) }
      end

      def do_persist(input)
        input[:feat].update!(input.except(:feat))

        { result: :ok }
      end
    end
  end
end
