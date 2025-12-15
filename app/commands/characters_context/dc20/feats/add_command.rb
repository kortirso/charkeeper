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

        def do_persist(input) # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
          return { result: :ok } if ::Character::Feat.exists?(input)

          ActiveRecord::Base.transaction do
            ::Character::Feat.create!(input.merge(ready_to_use: true))

            input[:feat].info['rewrite']&.each { |key, value| input[:character].data[key] = value }
            input[:feat].info['increase']&.each { |key, value| input[:character].data[key] += value }
            input[:feat].info['merge']&.each do |key, values|
              attribute = input[:character].data[key]
              values.each do |value_key, value|
                attribute = attribute.merge({ attribute[value_key] => attribute[value_key] + value })
              end
            end

            if input[:feat].origin == 'class'
              input[:character].data['classes'][input[:feat].origin_value] ||= 0
              input[:character].data['classes'][input[:feat].origin_value] += 1
            end

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
