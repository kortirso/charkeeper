class ChangeItemsInfo < ActiveRecord::Migration[8.0]
  def change
    Item.find_each do |item|
      if item.info['tooltips']
        tooltips = item.info['tooltips'].each_with_object({}) do |value, acc|
          splitted = value.split('-')
          splitted.size == 1 ? (acc[splitted[0]] = true) : (acc[splitted[0]] = splitted[1])
        end
        item.info['tooltips'] = tooltips
        item.save
      elsif item.info['caption']
        caption = item.info['caption'].each_with_object({}) do |value, acc|
          splitted = value.split('-')
          splitted.size == 1 ? (acc[splitted[0]] = true) : (acc[splitted[0]] = splitted[1])
        end
        item.info['caption'] = caption
        item.save
      end
    end
  end
end
