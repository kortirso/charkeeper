# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Mechanics
        class ChangeCommand < BaseCommand
          private

          def do_prepare(input)
            input[:existing_items] = input[:mechanic].items.group_by(&:id).transform_values(&:first)
          end

          def do_persist(input)
            ActiveRecord::Base.transaction do
              input[:mechanic].update!(input.slice(:title, :description, :public))

              if input[:items]
                change_items(input)
                remove_items(input)
              end
            end

            { result: :ok }
          end

          def change_items(input)
            add_command = HomebrewsV2Context::Import::Daggerheart::MechanicItems::AddCommand.new
            change_command = HomebrewsV2Context::Import::Daggerheart::MechanicItems::ChangeCommand.new

            input[:items].each do |item|
              if item[:id]
                existing_item = input[:existing_items][item[:id]]
                next unless existing_item

                change_command.call(item.except(:id).merge({ mechanic_item: existing_item }))
              else
                add_command.call(item.except(:id).merge(homebrew_id: input[:mechanic].id, user: input[:user]))
              end
            end
          end

          def remove_items(input)
            ::Daggerheart::Homebrews::MechanicItem.where(id: input[:existing_items].keys - input[:items].pluck(:id)).destroy_all
          end
        end
      end
    end
  end
end
