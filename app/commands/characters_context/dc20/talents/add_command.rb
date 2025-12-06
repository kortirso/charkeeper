# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Talents
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Dc20::Character)
            required(:feat).filled(type?: ::Dc20::Feat)
          end
        end

        private

        def do_persist(input) # rubocop: disable Metrics/AbcSize
          ActiveRecord::Base.transaction do
            ::Character::Feat.find_or_create_by(input)

            selected_talents = input[:character].data.selected_talents
            feat_id = input[:feat].id
            selected_talents.key?(feat_id) ? selected_talents[feat_id] += 1 : selected_talents[feat_id] = 1
            input[:character].data.selected_talents = selected_talents

            input[:feat].info['rewrite']&.each { |key, value| input[:character].data[key] = value }
            input[:feat].info['increase']&.each { |key, value| input[:character].data[key] += value }

            input[:character].save!
          end

          { result: :ok }
        end
      end
    end
  end
end
