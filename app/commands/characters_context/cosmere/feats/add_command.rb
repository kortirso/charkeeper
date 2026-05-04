# frozen_string_literal: true

module CharactersContext
  module Cosmere
    module Feats
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Cosmere::Character)
            required(:feat).filled(type?: ::Cosmere::Feat)
          end
        end

        private

        def do_persist(input)
          ::Character::Feat.create_with(ready_to_use: true).find_or_create_by(input.slice(:character, :feat))

          add_extra_feats(input)
          add_extra_skills(input)

          { result: :ok }
        end

        def add_extra_feats(input)
          return if input[:feat].info['extra_feats'].blank?

          ::Cosmere::Feat.where(slug: input[:feat].info['extra_feats']).find_each do |feat|
            Charkeeper::Container.resolve('commands.characters_context.cosmere.feats.add').call(
              character: input[:character],
              feat: feat
            )
          end
        end

        def add_extra_skills(input)
          return if input[:feat].info['extra_skills'].blank?

          input[:character].data.selected_skills.merge!(
            input[:feat].info['extra_skills'].index_with(1)
          )
          input[:character].save
        end
      end
    end
  end
end
