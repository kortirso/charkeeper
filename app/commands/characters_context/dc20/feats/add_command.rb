# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Feats
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Dc20::Character)
            required(:feat).filled(type?: ::Dc20::Feat)
          end
        end

        private

        def do_persist(input) # rubocop: disable Metrics/AbcSize
          return { result: :ok } if ::Character::Feat.exists?(input)

          ActiveRecord::Base.transaction do
            ::Character::Feat.create!(input)

            input[:feat].info['rewrite']&.each { |key, value| input[:character].data[key] = value }
            input[:feat].info['increase']&.each { |key, value| input[:character].data[key] += value }

            input[:character].data['classes'][input[:feat].origin_value] ||= 0
            input[:character].data['classes'][input[:feat].origin_value] += 1

            input[:character].save!
          end

          if input[:character].data['classes'][input[:feat].origin_value] == 2
            Charkeeper::Container.resolve('commands.characters_context.dc20.feats.add').call({
              character: input[:character],
              feat: ::Dc20::Feat.where(origin: 2).find_by(origin_value: input[:feat].origin_value)
            })
          end

          { result: :ok }
        end
      end
    end
  end
end
