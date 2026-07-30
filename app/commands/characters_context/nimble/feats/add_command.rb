# frozen_string_literal: true

module CharactersContext
  module Nimble
    module Feats
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Nimble::Character)
            required(:feat).filled(type?: ::Nimble::Feat)
          end
        end

        private

        def do_persist(input)
          return { result: :ok } if ::Character::Feat.exists?(input)

          ActiveRecord::Base.transaction do
            ::Character::Feat.create!(
              input.merge(
                ready_to_use: true,
                dices: input[:feat].dices ? [] : nil,
                tokens: input[:feat].tokens.nil? ? nil : 0
              )
            )

            input[:feat].info['increase']&.each { |key, value| input[:character].data[key] += value }
            input[:character].save!
          end

          { result: :ok }
        end
      end
    end
  end
end
